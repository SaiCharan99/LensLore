<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\StorySpecRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StorySpecRepository::class)]
#[ORM\Table(name: 'story_specs')]
class StorySpec
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'storySpec', targetEntity: Photo::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Photo $photo;

    /** @var array{bg: string, fg: string, accent: string, muted: string} */
    #[ORM\Column(type: 'json')]
    private array $palette;

    #[ORM\Column(type: 'string', length: 50)]
    private string $layout;

    #[ORM\Column(type: 'string', length: 50)]
    private string $motif;

    #[ORM\Column(type: 'string', length: 100)]
    private string $headingFont;

    #[ORM\Column(type: 'string', length: 255)]
    private string $title;

    #[ORM\Column(type: 'text')]
    private string $caption;

    #[ORM\Column(type: 'string', length: 100)]
    private string $mood;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    /**
     * @param array{bg: string, fg: string, accent: string, muted: string} $palette
     */
    public function __construct(
        Photo $photo,
        array $palette,
        string $layout,
        string $motif,
        string $headingFont,
        string $title,
        string $caption,
        string $mood,
    ) {
        $this->photo = $photo;
        $this->palette = $palette;
        $this->layout = $layout;
        $this->motif = $motif;
        $this->headingFont = $headingFont;
        $this->title = $title;
        $this->caption = $caption;
        $this->mood = $mood;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPhoto(): Photo
    {
        return $this->photo;
    }

    /** @return array{bg: string, fg: string, accent: string, muted: string} */
    public function getPalette(): array
    {
        /** @var array{bg: string, fg: string, accent: string, muted: string} */
        return $this->palette;
    }

    public function getLayout(): string
    {
        return $this->layout;
    }

    public function getMotif(): string
    {
        return $this->motif;
    }

    public function getHeadingFont(): string
    {
        return $this->headingFont;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getCaption(): string
    {
        return $this->caption;
    }

    public function getMood(): string
    {
        return $this->mood;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
