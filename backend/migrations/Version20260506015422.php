<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260506015422 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial schema: users, albums, photos, story_specs, messages';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE users (
            id          SERIAL PRIMARY KEY,
            email       VARCHAR(255) NOT NULL UNIQUE,
            created_at  TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        )');

        $this->addSql('CREATE TABLE albums (
            id           SERIAL PRIMARY KEY,
            user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title        VARCHAR(255) NOT NULL,
            date         VARCHAR(50)  NOT NULL,
            cover_s3_key VARCHAR(500),
            created_at   TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        )');

        $this->addSql('CREATE TABLE photos (
            id            SERIAL PRIMARY KEY,
            album_id      INT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
            s3_key        VARCHAR(500) NOT NULL,
            s3_thumb_key  VARCHAR(500) NOT NULL,
            note          TEXT NOT NULL,
            date          VARCHAR(50)  NOT NULL,
            created_at    TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        )');

        $this->addSql('CREATE TABLE story_specs (
            id           SERIAL PRIMARY KEY,
            photo_id     INT NOT NULL UNIQUE REFERENCES photos(id) ON DELETE CASCADE,
            palette      JSON NOT NULL,
            layout       VARCHAR(50)  NOT NULL,
            motif        VARCHAR(50)  NOT NULL,
            heading_font VARCHAR(100) NOT NULL,
            title        VARCHAR(255) NOT NULL,
            caption      TEXT NOT NULL,
            mood         VARCHAR(100) NOT NULL,
            created_at   TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        )');

        $this->addSql('CREATE TABLE messages (
            id         SERIAL PRIMARY KEY,
            photo_id   INT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
            role       VARCHAR(20) NOT NULL,
            content    TEXT NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        )');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS messages');
        $this->addSql('DROP TABLE IF EXISTS story_specs');
        $this->addSql('DROP TABLE IF EXISTS photos');
        $this->addSql('DROP TABLE IF EXISTS albums');
        $this->addSql('DROP TABLE IF EXISTS users');
    }
}
