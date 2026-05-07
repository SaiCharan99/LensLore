<?php

declare(strict_types=1);

namespace App\DTO;

/**
 * Matches the TypeScript DesignSpec interface in frontend/src/models/types.ts.
 * Also matches the Lambda story-generator output shape.
 */
final class StorySpecResponse
{
    /**
     * @param array{bg: string, fg: string, accent: string, muted: string} $palette
     */
    public function __construct(
        public readonly array $palette,
        public readonly string $layout,
        public readonly string $headingFont,
        public readonly string $motif,
        public readonly string $title,
        public readonly string $caption,
        public readonly string $mood,
    ) {
    }
}
