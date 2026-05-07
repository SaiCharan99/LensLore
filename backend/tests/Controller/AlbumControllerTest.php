<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Entity\Album;
use App\Entity\User;
use App\Repository\AlbumRepository;
use App\Repository\UserRepository;
use App\Service\S3Service;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

final class AlbumControllerTest extends WebTestCase
{
    public function testGetAlbumsReturnsEmptyList(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/albums');

        self::assertResponseIsSuccessful();
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($data);
    }

    public function testCreateAlbumReturns201(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/albums',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['title' => 'Highland Edges']) ?: '',
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($data);
        self::assertSame('Highland Edges', $data['title']);
        self::assertArrayHasKey('id', $data);
    }

    public function testCreateAlbumValidatesTitle(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/albums',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['title' => '']) ?: '',
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($data);
        self::assertArrayHasKey('errors', $data);
    }

    public function testGetAlbumPhotosReturns404ForMissingAlbum(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/albums/99999/photos');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testGetAlbumPhotosReturnsArrayForExistingAlbum(): void
    {
        $client = static::createClient();

        // Create album first
        $client->request(
            'POST',
            '/api/albums',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['title' => 'Garden Watch']) ?: '',
        );
        $created = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($created);
        $albumId = (int) $created['id'];

        // Fetch its photos
        $client->request('GET', sprintf('/api/albums/%d/photos', $albumId));
        self::assertResponseIsSuccessful();
        $photos = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertIsArray($photos);
        self::assertCount(0, $photos);
    }
}
