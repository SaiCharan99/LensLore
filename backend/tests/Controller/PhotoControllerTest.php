<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Service\LambdaService;
use App\Service\S3Service;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

final class PhotoControllerTest extends WebTestCase
{
    /**
     * Replace real S3Service + LambdaService with mocks for controller integration tests.
     * The real services would require live AWS credentials.
     */
    private function mockAwsServices(): void
    {
        // S3 stub — no call-count expectations, just controlled return values
        $s3 = $this->createStub(S3Service::class);
        $s3->method('uploadBase64Image')->willReturnArgument(1);
        $s3->method('presign')->willReturnCallback(fn (string $key) => 'https://cdn.test/' . $key);

        static::getContainer()->set(S3Service::class, $s3);

        // Lambda stub — returns a valid DesignSpec
        $lambda = $this->createStub(LambdaService::class);
        $lambda->method('generateStory')->willReturn(
            new \App\DTO\StorySpecResponse(
                palette: ['bg' => '#1a1f2e', 'fg' => '#F5EFE4', 'accent' => '#7a9fc4', 'muted' => 'rgba(245,239,228,0.78)'],
                layout: 'centered-stacked',
                headingFont: 'Playfair Display',
                motif: 'horizon-rule',
                title: 'The Test Story',
                caption: 'A generated caption.',
                mood: 'contemplative',
            )
        );

        static::getContainer()->set(LambdaService::class, $lambda);
    }

    public function testGetPhotoReturns404ForMissingPhoto(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/photos/99999');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testCreatePhotoValidatesPayload(): void
    {
        $client = static::createClient();
        $this->mockAwsServices();

        $client->request(
            'POST',
            '/api/photos',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['note' => '', 'mood' => '', 'albumId' => 0]) ?: '',
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($data);
        self::assertArrayHasKey('errors', $data);
    }

    public function testCreatePhotoReturns404ForMissingAlbum(): void
    {
        $client = static::createClient();
        $this->mockAwsServices();

        $client->request(
            'POST',
            '/api/photos',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'imageBase64' => base64_encode('fake-image'),
                'note' => 'Standing on the ridge above Torridon at dawn.',
                'mood' => 'contemplative',
                'albumId' => 99999,
            ]) ?: '',
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testCreatePhotoFullFlow(): void
    {
        $client = static::createClient();
        // Disable kernel reboot between requests so the AWS mocks survive all three requests.
        $client->disableReboot();
        $this->mockAwsServices();

        // Create an album first
        $client->request(
            'POST',
            '/api/albums',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['title' => 'Test Album']) ?: '',
        );
        $album = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($album);
        $albumId = (int) $album['id'];

        // Upload a photo
        $client->request(
            'POST',
            '/api/photos',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'imageBase64' => base64_encode('fake-image-bytes'),
                'note' => 'Standing on the ridge above Torridon just before sunrise.',
                'mood' => 'contemplative',
                'albumId' => $albumId,
            ]) ?: '',
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $photo = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($photo);
        self::assertSame($albumId, $photo['albumId']);
        self::assertIsArray($photo['storySpec']);
        self::assertSame('centered-stacked', $photo['storySpec']['layout']);
        self::assertSame('The Test Story', $photo['storySpec']['title']);

        // Fetch the photo by ID
        $photoId = (int) $photo['id'];
        $client->request('GET', sprintf('/api/photos/%d', $photoId));
        self::assertResponseIsSuccessful();
        $fetched = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($fetched);
        self::assertSame($photoId, $fetched['id']);
    }

    public function testAddMessageReturns404ForMissingPhoto(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/photos/99999/messages',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['content' => 'Tell me more.']) ?: '',
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }
}
