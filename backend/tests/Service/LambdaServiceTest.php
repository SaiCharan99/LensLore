<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Service\LambdaService;
use Aws\Lambda\LambdaClient;
use Aws\Result;
use PHPUnit\Framework\TestCase;

final class LambdaServiceTest extends TestCase
{
    /**
     * Build a LambdaService with a mocked LambdaClient injected via reflection.
     * invoke() dispatches through __call; we mock __call to return a controlled Result.
     *
     * @param array<string, mixed> $lambdaPayload
     */
    private function buildService(array $lambdaPayload): LambdaService
    {
        $clientStub = $this->createStub(LambdaClient::class);
        $clientStub
            ->method('__call')
            ->willReturn(new Result(['Payload' => json_encode($lambdaPayload)]));

        $service = new LambdaService('eu-west-1', 'arn:aws:lambda:eu-west-1:000:function:test');

        $ref = new \ReflectionClass($service);
        $prop = $ref->getProperty('client');
        $prop->setValue($service, $clientStub);

        return $service;
    }

    public function testGenerateStoryReturnsStorySpecResponse(): void
    {
        $service = $this->buildService([
            'palette' => ['bg' => '#1a1f2e', 'fg' => '#F5EFE4', 'accent' => '#7a9fc4', 'muted' => 'rgba(245,239,228,0.78)'],
            'layout' => 'centered-stacked',
            'headingFont' => 'Playfair Display',
            'motif' => 'horizon-rule',
            'title' => 'The Ridge at Dawn',
            'caption' => 'Cloud inversion below, silence above.',
            'mood' => 'contemplative',
        ]);

        $spec = $service->generateStory('base64data', 'Standing on the ridge', 'contemplative');

        self::assertSame('centered-stacked', $spec->layout);
        self::assertSame('Playfair Display', $spec->headingFont);
        self::assertSame('horizon-rule', $spec->motif);
        self::assertSame('The Ridge at Dawn', $spec->title);
        self::assertSame('Cloud inversion below, silence above.', $spec->caption);
        self::assertSame('contemplative', $spec->mood);
        self::assertSame('#1a1f2e', $spec->palette['bg']);
    }

    public function testGenerateStoryUsesDefaultsForMissingFields(): void
    {
        $service = $this->buildService([]);

        $spec = $service->generateStory('base64data', 'note', 'melancholy');

        self::assertSame('centered-stacked', $spec->layout);
        self::assertSame('Playfair Display', $spec->headingFont);
        self::assertSame('melancholy', $spec->mood);
    }

    public function testGenerateStoryThrowsOnErrorResponse(): void
    {
        $service = $this->buildService(['errorMessage' => 'Function timeout']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/Function timeout/');

        $service->generateStory('base64data', 'note', 'mood');
    }

    public function testGenerateStoryThrowsOnInvalidJson(): void
    {
        $clientStub = $this->createStub(LambdaClient::class);
        $clientStub
            ->method('__call')
            ->willReturn(new Result(['Payload' => 'not-json']));

        $service = new LambdaService('eu-west-1', 'arn:aws:lambda:eu-west-1:000:function:test');
        $ref = new \ReflectionClass($service);
        $prop = $ref->getProperty('client');
        $prop->setValue($service, $clientStub);

        $this->expectException(\RuntimeException::class);
        $service->generateStory('base64data', 'note', 'mood');
    }

    public function testGenerateStorySendsUserNoteFieldName(): void
    {
        // Regression test: the Lambda's input contract names this field `userNote`,
        // not `note`. A mismatch would cause the Lambda's input validator to reject
        // every photo upload.
        $captured = null;

        $clientMock = $this->createMock(LambdaClient::class);
        $clientMock
            ->expects(self::once())
            ->method('__call')
            ->willReturnCallback(function (string $method, array $args) use (&$captured): Result {
                $captured = $args[0];

                return new Result([
                    'Payload' => json_encode([
                        'palette' => ['bg' => '#000', 'fg' => '#fff', 'accent' => '#888', 'muted' => '#444'],
                        'layout' => 'centered-stacked',
                        'headingFont' => 'Playfair Display',
                        'motif' => 'horizon-rule',
                        'title' => 't',
                        'caption' => 'c',
                        'mood' => 'm',
                    ]),
                ]);
            });

        $service = new LambdaService('eu-west-1', 'arn:aws:lambda:eu-west-1:000:function:test');
        $ref = new \ReflectionClass($service);
        $prop = $ref->getProperty('client');
        $prop->setValue($service, $clientMock);

        $service->generateStory('imgdata', 'a heartfelt note about the ridge', 'contemplative');

        self::assertIsArray($captured);
        self::assertArrayHasKey('Payload', $captured);
        $payload = json_decode($captured['Payload'], true);
        self::assertIsArray($payload);
        self::assertArrayHasKey('userNote', $payload, 'Symfony must send `userNote` to match the Lambda input contract.');
        self::assertArrayNotHasKey('note', $payload);
        self::assertSame('a heartfelt note about the ridge', $payload['userNote']);
    }

    public function testContinueConversationReturnsReply(): void
    {
        $service = $this->buildGoDeeperService(['reply' => 'The light at that hour does carry weight.']);

        $reply = $service->continueConversation(
            photoId: '42',
            conversationHistory: [['role' => 'user', 'content' => 'I noticed the cloud line.']],
            newMessage: 'Tell me more.',
        );

        self::assertSame('The light at that hour does carry weight.', $reply);
    }

    public function testContinueConversationThrowsWhenArnNotConfigured(): void
    {
        // Constructed with empty go-deeper ARN — must reject before any AWS call.
        $service = new LambdaService('eu-west-1', 'arn:aws:lambda:eu-west-1:000:function:test');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/LAMBDA_GO_DEEPER_ARN/');

        $service->continueConversation('1', [], 'hello');
    }

    public function testContinueConversationThrowsOnErrorResponse(): void
    {
        $service = $this->buildGoDeeperService(['errorMessage' => 'cold start failure']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/cold start failure/');

        $service->continueConversation('1', [], 'hi');
    }

    public function testContinueConversationThrowsWhenReplyMissing(): void
    {
        $service = $this->buildGoDeeperService(['unrelated' => 'field']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/missing "reply"/');

        $service->continueConversation('1', [], 'hi');
    }

    /**
     * @param array<string, mixed> $lambdaPayload
     */
    private function buildGoDeeperService(array $lambdaPayload): LambdaService
    {
        $clientStub = $this->createStub(LambdaClient::class);
        $clientStub
            ->method('__call')
            ->willReturn(new Result(['Payload' => json_encode($lambdaPayload)]));

        $service = new LambdaService(
            awsRegion: 'eu-west-1',
            storyArn: 'arn:aws:lambda:eu-west-1:000:function:test',
            goDeeperArn: 'arn:aws:lambda:eu-west-1:000:function:go-deeper-test',
        );

        $ref = new \ReflectionClass($service);
        $prop = $ref->getProperty('client');
        $prop->setValue($service, $clientStub);

        return $service;
    }
}
