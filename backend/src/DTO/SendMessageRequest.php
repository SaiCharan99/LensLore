<?php

declare(strict_types=1);

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

final class SendMessageRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Message content is required.')]
        #[Assert\Length(min: 1, max: 2000)]
        public readonly string $content,
    ) {
    }
}
