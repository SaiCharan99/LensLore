<?php

declare(strict_types=1);

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateAlbumRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Title is required.')]
        #[Assert\Length(min: 1, max: 255, maxMessage: 'Title must be at most 255 characters.')]
        public readonly string $title,
    ) {
    }
}
