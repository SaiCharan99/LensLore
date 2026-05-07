<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Service\S3Service;
use Aws\S3\S3Client;
use PHPUnit\Framework\TestCase;

final class S3ServiceTest extends TestCase
{
    private function buildServiceWithMockedClient(): S3Service
    {
        $service = new S3Service('eu-west-1', 'lenslore-photos-test');

        $clientMock = $this->createStub(S3Client::class);

        $ref = new \ReflectionClass($service);
        $prop = $ref->getProperty('client');
        $prop->setValue($service, $clientMock);

        return $service;
    }

    public function testUploadBase64ImageThrowsOnInvalidBase64(): void
    {
        $service = $this->buildServiceWithMockedClient();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/Invalid base64/');

        $service->uploadBase64Image('!!!not-base64!!!', 'photos/test.jpg');
    }

    public function testUploadBase64ImageReturnsS3Key(): void
    {
        $service = new S3Service('eu-west-1', 'lenslore-photos-test');

        $mock = $this->createMock(S3Client::class);
        // putObject dispatches through __call; mock intercepts and returns null (return value unused)
        $mock->expects($this->once())->method('__call');

        $ref = new \ReflectionClass($service);
        $prop = $ref->getProperty('client');
        $prop->setValue($service, $mock);

        $key = $service->uploadBase64Image(base64_encode('fake-image-bytes'), 'photos/test.jpg');

        self::assertSame('photos/test.jpg', $key);
    }
}
