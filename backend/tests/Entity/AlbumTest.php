<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Album;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

final class AlbumTest extends TestCase
{
    public function testConstructorSetsDefaults(): void
    {
        $user = new User('test@example.com');
        $album = new Album($user, 'Highland Edges');

        self::assertSame('Highland Edges', $album->getTitle());
        self::assertSame($user, $album->getUser());
        self::assertNull($album->getCoverS3Key());
        self::assertCount(0, $album->getPhotos());
        self::assertNull($album->getId());
        self::assertMatchesRegularExpression('/^\d{1,2} \w+ \d{4}$/', $album->getDate());
    }

    public function testSetTitle(): void
    {
        $user = new User('test@example.com');
        $album = new Album($user, 'Old Title');
        $album->setTitle('New Title');

        self::assertSame('New Title', $album->getTitle());
    }

    public function testSetCoverS3Key(): void
    {
        $user = new User('test@example.com');
        $album = new Album($user, 'Coastal');
        $album->setCoverS3Key('1/abc123.jpg');

        self::assertSame('1/abc123.jpg', $album->getCoverS3Key());

        $album->setCoverS3Key(null);
        self::assertNull($album->getCoverS3Key());
    }
}
