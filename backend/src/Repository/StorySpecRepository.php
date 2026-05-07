<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\StorySpec;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<StorySpec>
 */
class StorySpecRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StorySpec::class);
    }
}
