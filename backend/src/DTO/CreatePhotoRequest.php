<?php

declare(strict_types=1);

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

final class CreatePhotoRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Image data is required.')]
        #[Assert\Length(max: 15_000_000, maxMessage: 'Image too large (max ~10 MB base64).')]
        public readonly string $imageBase64,
        #[Assert\NotBlank(message: 'A note is required.')]
        #[Assert\Length(min: 10, max: 2000, minMessage: 'Note must be at least 10 characters.')]
        public readonly string $note,
        #[Assert\NotBlank(message: 'Mood is required.')]
        #[Assert\Length(max: 100)]
        public readonly string $mood,
        #[Assert\NotNull(message: 'Album ID is required.')]
        #[Assert\Positive(message: 'Album ID must be a positive integer.')]
        public readonly int $albumId,
    ) {
    }
}
