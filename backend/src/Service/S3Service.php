<?php

declare(strict_types=1);

namespace App\Service;

use Aws\S3\S3Client;

class S3Service
{
    private S3Client $client;
    private readonly string $bucket;

    public function __construct(string $awsRegion, string $awsBucket, string $awsKey = '', string $awsSecret = '')
    {
        $config = [
            'version' => 'latest',
            'region' => $awsRegion,
        ];

        if ($awsKey !== '' && $awsSecret !== '') {
            $config['credentials'] = [
                'key' => $awsKey,
                'secret' => $awsSecret,
            ];
        }

        $this->client = new S3Client($config);
        $this->bucket = $awsBucket;
    }

    /**
     * Upload a base64-encoded image to S3.
     * Returns the S3 object key.
     */
    public function uploadBase64Image(string $base64Data, string $s3Key, string $contentType = 'image/jpeg'): string
    {
        $binary = base64_decode($base64Data, true);
        if ($binary === false) {
            throw new \InvalidArgumentException('Invalid base64 image data.');
        }

        $this->client->putObject([
            'Bucket' => $this->bucket,
            'Key' => $s3Key,
            'Body' => $binary,
            'ContentType' => $contentType,
            'ACL' => 'private',
        ]);

        return $s3Key;
    }

    /**
     * Generate a presigned URL valid for 1 hour.
     */
    public function presign(string $s3Key, int $expiresInSeconds = 3600): string
    {
        $cmd = $this->client->getCommand('GetObject', [
            'Bucket' => $this->bucket,
            'Key' => $s3Key,
        ]);

        $request = $this->client->createPresignedRequest($cmd, sprintf('+%d seconds', $expiresInSeconds));

        return (string) $request->getUri();
    }

    public function delete(string $s3Key): void
    {
        $this->client->deleteObject([
            'Bucket' => $this->bucket,
            'Key' => $s3Key,
        ]);
    }
}
