<?php

declare(strict_types=1);

namespace App\Service;

use App\DTO\StorySpecResponse;
use Aws\Lambda\LambdaClient;

class LambdaService
{
    private LambdaClient $client;
    private readonly string $storyArn;
    private readonly string $goDeeperArn;

    public function __construct(
        string $awsRegion,
        string $storyArn,
        string $goDeeperArn = '',
        string $awsKey = '',
        string $awsSecret = '',
    ) {
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
        $this->goDeeperArn = $goDeeperArn;
    }

    /**
     * Invoke the story-generator Lambda and return a structured DesignSpec.
     */
    public function generateStory(string $imageBase64, string $note, string $mood): StorySpecResponse
    {
        // The Lambda's input contract names this field `userNote` (see lambdas/src/story-generator/types.ts).
        $payload = json_encode([
            'imageBase64' => $imageBase64,
            'userNote' => $note,
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
     * Invoke the go-deeper Lambda for a follow-up message about a photo.
     *
     * @param list<array{role: 'user'|'assistant', content: string}> $conversationHistory
     * @param array{title?: string, caption?: string, mood?: string, note?: string}|null $photoContext
     */
    public function continueConversation(
        string $photoId,
        array $conversationHistory,
        string $newMessage,
        ?array $photoContext = null,
    ): string {
        if ($this->goDeeperArn === '') {
            throw new \RuntimeException('go-deeper Lambda ARN is not configured (set LAMBDA_GO_DEEPER_ARN).');
        }

        $payload = json_encode([
            'photoId' => $photoId,
            'photoContext' => $photoContext ?? new \stdClass(),
            'conversationHistory' => $conversationHistory,
            'newMessage' => $newMessage,
        ]);

        if ($payload === false) {
            throw new \RuntimeException('Failed to encode go-deeper payload.');
        }

        $result = $this->client->invoke([
            'FunctionName' => $this->goDeeperArn,
            'InvocationType' => 'RequestResponse',
            'Payload' => $payload,
        ]);

        $responsePayload = (string) $result['Payload'];
        $data = json_decode($responsePayload, true);

        if (!is_array($data)) {
            throw new \RuntimeException('go-deeper returned an invalid response.');
        }

        if (isset($data['errorMessage'])) {
            throw new \RuntimeException('go-deeper error: ' . (string) $data['errorMessage']);
        }

        $reply = $data['reply'] ?? null;
        if (!is_string($reply) || $reply === '') {
            throw new \RuntimeException('go-deeper response missing "reply" string.');
        }

        return $reply;
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
