<?php

declare(strict_types=1);

namespace App\Controller;

use App\DTO\CreatePhotoRequest;
use App\DTO\SendMessageRequest;
use App\Entity\Message;
use App\Entity\Photo;
use App\Entity\StorySpec;
use App\Repository\AlbumRepository;
use App\Repository\PhotoRepository;
use App\Service\LambdaService;
use App\Service\S3Service;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
final class PhotoController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly AlbumRepository $albumRepo,
        private readonly PhotoRepository $photoRepo,
        private readonly S3Service $s3,
        private readonly LambdaService $lambda,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /**
     * POST /api/photos
     * Accepts { imageBase64, note, mood, albumId }
     * Uploads to S3, invokes Lambda, persists and returns the DesignSpec.
     */
    #[Route('/photos', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $body = $this->decodeJson($request);
        if ($body instanceof JsonResponse) {
            return $body;
        }

        $dto = new CreatePhotoRequest(
            imageBase64: (string) ($body['imageBase64'] ?? ''),
            note: (string) ($body['note'] ?? ''),
            mood: (string) ($body['mood'] ?? ''),
            albumId: (int) ($body['albumId'] ?? 0),
        );

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationError($errors);
        }

        $album = $this->albumRepo->find($dto->albumId);
        if ($album === null) {
            return $this->json(['error' => 'Album not found.'], Response::HTTP_NOT_FOUND);
        }

        $photoId = bin2hex(random_bytes(16));
        $s3Key = sprintf('%d/%s.jpg', $album->getId(), $photoId);
        $s3ThumbKey = sprintf('%d/%s_thumb.jpg', $album->getId(), $photoId);

        try {
            $this->s3->uploadBase64Image($dto->imageBase64, $s3Key);
            // Thumbnail upload: in production a Lambda resize step would handle this;
            // for now reuse the original as the thumb key placeholder.
            $this->s3->uploadBase64Image($dto->imageBase64, $s3ThumbKey);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Image upload failed: ' . $e->getMessage()], Response::HTTP_BAD_GATEWAY);
        }

        try {
            $spec = $this->lambda->generateStory($dto->imageBase64, $dto->note, $dto->mood);
        } catch (\Throwable $e) {
            $this->s3->delete($s3Key);
            $this->s3->delete($s3ThumbKey);

            return $this->json(['error' => 'Story generation failed: ' . $e->getMessage()], Response::HTTP_BAD_GATEWAY);
        }

        $photo = new Photo($album, $s3Key, $s3ThumbKey, $dto->note);

        $storySpec = new StorySpec(
            photo: $photo,
            palette: $spec->palette,
            layout: $spec->layout,
            motif: $spec->motif,
            headingFont: $spec->headingFont,
            title: $spec->title,
            caption: $spec->caption,
            mood: $spec->mood,
        );
        $photo->setStorySpec($storySpec);

        // Keep first photo as cover
        if ($album->getCoverS3Key() === null) {
            $album->setCoverS3Key($s3Key);
        }

        $this->em->persist($photo);
        $this->em->persist($storySpec);
        $this->em->flush();

        return $this->json($this->serializePhoto($photo), Response::HTTP_CREATED);
    }

    /**
     * GET /api/photos/{id}
     */
    #[Route('/photos/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $photo = $this->photoRepo->find($id);
        if ($photo === null) {
            return $this->json(['error' => 'Photo not found.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serializePhoto($photo));
    }

    /**
     * POST /api/photos/{id}/messages
     * Send a "Go Deeper" follow-up; Lambda continues the conversation.
     */
    #[Route('/photos/{id}/messages', methods: ['POST'])]
    public function addMessage(int $id, Request $request): JsonResponse
    {
        $photo = $this->photoRepo->find($id);
        if ($photo === null) {
            return $this->json(['error' => 'Photo not found.'], Response::HTTP_NOT_FOUND);
        }

        $body = $this->decodeJson($request);
        if ($body instanceof JsonResponse) {
            return $body;
        }

        $dto = new SendMessageRequest(content: (string) ($body['content'] ?? ''));
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationError($errors);
        }

        $userMsg = new Message($photo, Message::ROLE_USER, $dto->content);
        $this->em->persist($userMsg);

        // In Phase 3 this will invoke Lambda with the conversation history.
        // For now return a placeholder assistant response.
        $assistantMsg = new Message(
            $photo,
            Message::ROLE_ASSISTANT,
            'The story continues — Lambda integration arrives in Phase 3.',
        );
        $this->em->persist($assistantMsg);
        $this->em->flush();

        return $this->json([
            'user' => $this->serializeMessage($userMsg),
            'assistant' => $this->serializeMessage($assistantMsg),
        ], Response::HTTP_CREATED);
    }

    // ── Serialisation helpers ────────────────────────────────────────────────

    /**
     * @return array<string, mixed>
     */
    private function serializePhoto(Photo $photo): array
    {
        $spec = $photo->getStorySpec();
        $messages = array_map([$this, 'serializeMessage'], $photo->getMessages()->toArray());

        return [
            'id' => $photo->getId(),
            'albumId' => $photo->getAlbum()->getId(),
            'img' => $this->s3->presign($photo->getS3Key()),
            'thumb' => $this->s3->presign($photo->getS3ThumbKey()),
            'note' => $photo->getNote(),
            'date' => $photo->getDate(),
            'storySpec' => $spec !== null ? $this->serializeSpec($spec) : null,
            'messages' => $messages,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeSpec(StorySpec $spec): array
    {
        return [
            'palette' => $spec->getPalette(),
            'layout' => $spec->getLayout(),
            'headingFont' => $spec->getHeadingFont(),
            'motif' => $spec->getMotif(),
            'title' => $spec->getTitle(),
            'caption' => $spec->getCaption(),
            'mood' => $spec->getMood(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeMessage(Message $message): array
    {
        return [
            'id' => $message->getId(),
            'role' => $message->getRole(),
            'content' => $message->getContent(),
            'createdAt' => $message->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    // ── Request helpers ──────────────────────────────────────────────────────

    /**
     * @return array<string, mixed>|JsonResponse
     */
    private function decodeJson(Request $request): array|JsonResponse
    {
        $content = $request->getContent();
        if ($content === '') {
            return $this->json(['error' => 'Request body must be JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($content, true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        return $data;
    }

    private function validationError(\Symfony\Component\Validator\ConstraintViolationListInterface $errors): JsonResponse
    {
        $messages = [];
        foreach ($errors as $error) {
            $messages[$error->getPropertyPath()] = $error->getMessage();
        }

        return $this->json(['errors' => $messages], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
