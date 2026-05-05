# Backend — Agent Orientation

Symfony 6 + PHP 8.2. **Phase 2 — not started yet.**

This directory is empty. Build it here.

---

## What to build

A JSON REST API that sits between the Aurelia frontend and the AWS Lambda functions.

---

## Step-by-step setup (do this first)

```bash
cd backend

# 1. Create Symfony project
composer create-project symfony/skeleton:"6.4.*" .

# 2. Add required bundles
composer require symfony/orm-pack symfony/validator symfony/serializer-pack
composer require symfony/http-client aws/aws-sdk-php
composer require --dev phpunit/phpunit phpstan/phpstan symplify/easy-coding-standard

# 3. Copy .env to .env.local and fill in values
cp .env .env.local
# DATABASE_URL="postgresql://user:pass@127.0.0.1:5432/lenslore?serverVersion=15"
# AWS_REGION=eu-west-1
# AWS_S3_BUCKET=lenslore-photos-dev
# LAMBDA_STORY_ARN=arn:aws:lambda:...
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Create the database
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# 5. Start dev server
symfony serve    # http://localhost:8000

# 6. Run tests
php bin/phpunit
```

---

## API endpoints to implement

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/photos` | Receive image + note + mood, store in S3, invoke Lambda, return DesignSpec |
| `GET` | `/api/photos/{id}` | Fetch photo with its DesignSpec and conversation history |
| `POST` | `/api/photos/{id}/messages` | Send "Go Deeper" follow-up message |
| `GET` | `/api/albums` | List albums with cover photo URL and count |
| `POST` | `/api/albums` | Create a new album |
| `GET` | `/api/albums/{id}/photos` | List photos in an album |

---

## Domain entities to create

```
src/
├── Entity/
│   ├── User.php         (id, email, createdAt)
│   ├── Album.php        (id, user, title, date, coverPhoto, photos[])
│   ├── Photo.php        (id, album, s3Key, note, date, storySpec, messages[])
│   ├── StorySpec.php    (id, photo, palette, layout, motif, title, caption, mood, headingFont)
│   └── Message.php      (id, photo, role [user|assistant], content, createdAt)
├── Repository/          (one per entity, extend ServiceEntityRepository)
├── DTO/
│   ├── CreatePhotoRequest.php   (imageBase64, note, mood — validated)
│   ├── CreateAlbumRequest.php   (title)
│   └── StorySpecResponse.php    (matches Lambda output + frontend DesignSpec interface)
├── Service/
│   ├── S3Service.php            (upload image, generate presigned URL)
│   └── LambdaService.php        (invoke story-generator Lambda, parse response)
└── Controller/
    ├── PhotoController.php
    └── AlbumController.php
```

---

## TypeScript ↔ PHP type contract

The frontend `DesignSpec` interface (in `frontend/src/models/types.ts`) must match the PHP `StorySpecResponse` DTO field-for-field:

```typescript
// frontend/src/models/types.ts
interface DesignSpec {
  palette: { bg, fg, accent, muted }
  layout: 'centered-stacked' | 'asymmetric-left' | ...
  headingFont: 'Playfair Display' | 'EB Garamond'
  motif: 'horizon-rule' | 'rain-streaks' | ...
  title: string
  caption: string
  mood: string
}
```

```php
// src/DTO/StorySpecResponse.php
class StorySpecResponse {
    public array $palette;   // [bg, fg, accent, muted]
    public string $layout;
    public string $headingFont;
    public string $motif;
    public string $title;
    public string $caption;
    public string $mood;
}
```

---

## PHPStan level 8

```bash
# Run in CI and before every commit
vendor/bin/phpstan analyse src --level=8
```

PHPStan config goes in `phpstan.neon`. All return types, parameter types, and property types must be explicit. No `mixed` unless genuinely unavoidable.

---

## S3 image upload flow

```
POST /api/photos
  → validate request (note required, image required, max 10MB)
  → upload image to S3: lenslore-photos-{env}/{userId}/{photoId}.jpg
  → invoke story-generator Lambda with { imageBase64, note, mood }
  → persist Photo + StorySpec entities
  → return StorySpecResponse JSON
```

The S3 key format must be stable — CloudFront will serve images at `https://cdn.lenslore.com/{s3key}`.

---

## Testing standard

- PHPUnit for every controller endpoint (integration tests, hit real DB in test env)
- Unit tests for `S3Service` and `LambdaService` (mock AWS SDK)
- `php bin/phpunit --coverage-text` must show >80% coverage
- Write tests in the same PR as the feature — not after
