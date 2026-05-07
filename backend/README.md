# LensLore Backend

Symfony 6.4 + PHP 8.5 REST API. Persists albums, photos, story specs, and conversation messages; uploads images to S3; invokes Lambdas for story generation and follow-up Q&A.

For the architectural spec, see [AGENTS.md](AGENTS.md).

## Prerequisites

- PHP 8.2+
- Composer 2
- PostgreSQL 15 (`brew install postgresql@15` on macOS)

## First-time setup

```bash
composer install

# Create the dev and test databases
createdb -U <pguser> lenslore
createdb -U <pguser> lenslore_test

# Configure
cp .env .env.local        # local-only — gitignored. Set DATABASE_URL + AWS_*

php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:migrations:migrate --no-interaction --env=test

symfony serve              # http://localhost:8000
```

## Quality gates

```bash
php bin/phpunit                           # 21 tests, 62 assertions
vendor/bin/phpstan analyse src --level=8 --memory-limit=512M
vendor/bin/ecs check src tests            # add --fix to auto-format
```

All three must pass before merging.

## API surface

| Method | Path                              | Purpose                                              |
| ------ | --------------------------------- | ---------------------------------------------------- |
| GET    | `/api/albums`                     | List albums for the current user                     |
| POST   | `/api/albums`                     | Create an album                                      |
| GET    | `/api/albums/{id}/photos`         | List photos in an album                              |
| POST   | `/api/photos`                     | Upload image, invoke story Lambda, persist Photo+Spec |
| GET    | `/api/photos/{id}`                | Fetch a photo with presigned image URLs              |
| POST   | `/api/photos/{id}/messages`       | Send a follow-up message (Phase 3 hooks the Lambda)  |

## Layout

```
src/
├── Controller/         AlbumController, PhotoController
├── Entity/             User, Album, Photo, StorySpec, Message (Doctrine ORM)
├── Repository/         One per entity
├── DTO/                CreateAlbumRequest, CreatePhotoRequest, SendMessageRequest, StorySpecResponse
├── Service/            S3Service, LambdaService (AWS SDK wrappers)
└── EventListener/      CorsListener (allows http://localhost:3000)
```

## Notes worth knowing

- **Test mocking.** `S3Service` and `LambdaService` are NOT `final` and `$client` is NOT `readonly` — required so PHPUnit can mock them and tests can inject mocks via reflection.
- **AWS SDK magic methods.** `S3Client::putObject` and `LambdaClient::invoke` are dispatched through `__call`, so service unit tests mock `__call` directly (e.g. `$mock->method('__call')->willReturn(new Result([...]))`).
- **Multi-request integration tests** must call `$client->disableReboot()` after `static::createClient()`, otherwise Symfony reboots the kernel between requests and the AWS service mock set via `static::getContainer()->set()` is lost.
- **PHPStan + Doctrine.** Level 8 needs `phpstan/phpstan-doctrine` to understand entity ID assignment via reflection. Configured in [`phpstan.neon`](phpstan.neon) with `tests/bootstrap_doctrine.php` as the object-manager loader.
