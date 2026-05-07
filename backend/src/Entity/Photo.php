<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\PhotoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PhotoRepository::class)]
#[ORM\Table(name: 'photos')]
class Photo
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Album::class, inversedBy: 'photos')]
    #[ORM\JoinColumn(nullable: false)]
    private Album $album;

    /** S3 object key — full-resolution image */
    #[ORM\Column(type: 'string', length: 500)]
    private string $s3Key;

    /** S3 object key — thumbnail (400 px wide) */
    #[ORM\Column(type: 'string', length: 500)]
    private string $s3ThumbKey;

    #[ORM\Column(type: 'text')]
    private string $note;

    #[ORM\Column(type: 'string', length: 50)]
    private string $date;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\OneToOne(mappedBy: 'photo', targetEntity: StorySpec::class, cascade: ['remove'])]
    private ?StorySpec $storySpec = null;

    /** @var Collection<int, Message> */
    #[ORM\OneToMany(mappedBy: 'photo', targetEntity: Message::class, cascade: ['remove'])]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    private Collection $messages;

    public function __construct(Album $album, string $s3Key, string $s3ThumbKey, string $note)
    {
        $this->album = $album;
        $this->s3Key = $s3Key;
        $this->s3ThumbKey = $s3ThumbKey;
        $this->note = $note;
        $this->date = (new \DateTimeImmutable())->format('d F Y');
        $this->createdAt = new \DateTimeImmutable();
        $this->messages = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAlbum(): Album
    {
        return $this->album;
    }

    public function getS3Key(): string
    {
        return $this->s3Key;
    }

    public function getS3ThumbKey(): string
    {
        return $this->s3ThumbKey;
    }

    public function getNote(): string
    {
        return $this->note;
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getStorySpec(): ?StorySpec
    {
        return $this->storySpec;
    }

    public function setStorySpec(?StorySpec $storySpec): void
    {
        $this->storySpec = $storySpec;
    }

    /** @return Collection<int, Message> */
    public function getMessages(): Collection
    {
        return $this->messages;
    }
}
