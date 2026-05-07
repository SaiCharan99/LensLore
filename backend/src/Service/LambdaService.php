<?php

declare(strict_types=1);

namespace App\Service;

use App\DTO\StorySpecResponse;
use Aws\Lambda\LambdaClient;

class LambdaService
{
    private LambdaClient $client;
    private readonly string $storyArn;

    public function __construct(string $awsRegion, string $storyArn, string $awsKey = '', string $awsSecret = '')
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

        $this->client = new LambdaClient($config);
        $this->storyArn = $storyArn;
    }

    /**
     * Invoke the story-generator Lambda and return a structured DesignSpec.
     */
    public function generateStory(string $imageBase64, string $note, string $mood): StorySpecResponse
    {
        $payload = json_encode([
            'imageBase64' => $imageBase64,
            'note' => $note,
            'mood' => $mood,
        ]);

        if ($payload === false) {
            throw new \RuntimeException('Failed to encode Lambda payload.');
        }

        $result = $this->client->invoke([
            'FunctionName' => $this->storyArn,
            'InvocationType' => 'RequestResponse',
            'Payload' => $payload,
        ]);

        $responsePayload = (string) $result['Payload'];
        $data = json_decode($responsePayload, true);

        if (!is_array($data)) {
            throw new \RuntimeException('Lambda returned an invalid response.');
        }

        if (isset($data['errorMessage'])) {
            throw new \RuntimeException('Lambda error: ' . (string) $data['errorMessage']);
        }

        return $this->parseStorySpec($data, $mood);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function parseStorySpec(array $data, string $fallbackMood): StorySpecResponse
    {
        $palette = $data['palette'] ?? [];
        if (!is_array($palette)) {
            $palette = [];
        }

        return new StorySpecResponse(
            palette: [
                'bg' => (string) ($palette['bg'] ?? '#1a1f2e'),
                'fg' => (string) ($palette['fg'] ?? '#F5EFE4'),
                'accent' => (string) ($palette['accent'] ?? '#7a9fc4'),
                'muted' => (string) ($palette['muted'] ?? 'rgba(245,239,228,0.78)'),
            ],
            layout: (string) ($data['layout'] ?? 'centered-stacked'),
            headingFont: (string) ($data['headingFont'] ?? 'Playfair Display'),
            motif: (string) ($data['motif'] ?? 'horizon-rule'),
            title: (string) ($data['title'] ?? ''),
            caption: (string) ($data['caption'] ?? ''),
            mood: (string) ($data['mood'] ?? $fallbackMood),
        );
    }
}
