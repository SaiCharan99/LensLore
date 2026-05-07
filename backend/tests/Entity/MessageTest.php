<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Album;
use App\Entity\Message;
use App\Entity\Photo;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

final class MessageTest extends TestCase
{
    private function makePhoto(): Photo
    {
        $user = new User('test@example.com');
        $album = new Album($user, 'Test Album');

        return new Photo($album, 'photos/img.jpg', 'photos/img_thumb.jpg', 'A quiet morning on the ridge.');
    }

    public function testRoleConstants(): void
    {
        self::assertSame('user', Message::ROLE_USER);
        self::assertSame('assistant', Message::ROLE_ASSISTANT);
    }

    public function testConstructorSetsFields(): void
    {
        $photo = $this->makePhoto();
        $msg = new Message($photo, Message::ROLE_USER, 'Tell me more about the light.');

        self::assertSame($photo, $msg->getPhoto());
        self::assertSame(Message::ROLE_USER, $msg->getRole());
        self::assertSame('Tell me more about the light.', $msg->getContent());
        self::assertInstanceOf(\DateTimeImmutable::class, $msg->getCreatedAt());
    }
}
