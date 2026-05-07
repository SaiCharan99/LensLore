<?php

declare(strict_types=1);

namespace App\Controller;

use App\DTO\CreateAlbumRequest;
use App\Entity\Album;
use App\Repository\AlbumRepository;
use App\Repository\PhotoRepository;
use App\Repository\UserRepository;
use App\Service\S3Service;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
final class AlbumController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepo,
        private readonly AlbumRepository $albumRepo,
        private readonly PhotoRepository $photoRepo,
        private readonly S3Service $s3,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /**
     * GET /api/albums
     * Returns albums for the default dev user (auth is Phase 4+).
     */
    #[Route('/albums', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->userRepo->findOrCreate('dev@lenslore.test');
        $this->em->flush();

        $albums = $this->albumRepo->findByUser($user);

        return $this->json(array_map([$this, 'serializeAlbum'], $albums));
    }

    /**
     * POST /api/albums
     * Body: { title: string }
     */
    #[Route('/albums', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $body = $this->decodeJson($request);
        if ($body instanceof JsonResponse) {
            return $body;
        }

        $dto = new CreateAlbumRequest(title: (string) ($body['title'] ?? ''));
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->validationError($errors);
        }

        $user = $this->userRepo->findOrCreate('dev@lenslore.test');
        $album = new Album($user, $dto->title);
        $this->em->persist($album);
        $this->em->flush();

        return $this->json($this->serializeAlbum($album), Response::HTTP_CREATED);
    }

    /**
     * GET /api/albums/{id}/photos
     */
    #[Route('/albums/{id}/photos', methods: ['GET'])]
    public function photos(int $id): JsonResponse
    {
        $album = $this->albumRepo->find($id);
        if ($album === null) {
            return $this->json(['error' => 'Album not found.'], Response::HTTP_NOT_FOUND);
        }

        $photos = $this->photoRepo->findByAlbum($album);
        $data = array_map(fn ($p) => [
            'id' => $p->getId(),
            'thumb' => $this->s3->presign($p->getS3ThumbKey()),
            'note' => $p->getNote(),
            'date' => $p->getDate(),
        ], $photos);

        return $this->json($data);
    }

    // ── Serialisation helpers ────────────────────────────────────────────────

    /**
     * @return array<string, mixed>
     */
    private function serializeAlbum(Album $album): array
    {
        $coverKey = $album->getCoverS3Key();

        return [
            'id' => $album->getId(),
            'title' => $album->getTitle(),
            'date' => $album->getDate(),
            'coverImg' => $coverKey !== null ? $this->s3->presign($coverKey) : null,
            'photoCount' => $album->getPhotos()->count(),
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
