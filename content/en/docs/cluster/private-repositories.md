---
title: "Private repositories"
description: "Configure user supplied SSH keys, repository URL credentials and Docker registry credentials for private measurements"
date: 2026-04-27T00:00:00+00:00
weight: 1006
---

GMT can use SSH keys submitted by users through the Dashboard or the command line when measuring private Git repositories in a cluster setup.
It can also use credentials embedded in an HTTPS repository URL, and credentials for private Docker registries to pull and build images.

There are two different key types involved, and they are used on different machines:

- The GMT Dashboard server uses an RSA PEM public key configured in `config.yml` to encrypt user supplied SSH keys and other secrets before storing them.
- Each runner or cluster machine that executes measurements uses the matching RSA PEM private key configured in `config.yml` to decrypt the stored SSH key and other secrets when it executes a job.
- The user submits an OpenSSH private key through the Dashboard or command line. This is the key used by Git, through ssh, when cloning the measured repository.

We do this so that when the Dashboard machine or the database is leaked we do not expose any SSH keys or other secrets.

Do not mix these formats. The encryption keys configured in `config.yml` must be RSA PEM files. The user supplied SSH key submitted through the Dashboard or passed on the command line must be an OpenSSH private key block.

The same key pair encrypts every secret that users hand to GMT for cluster runs.

- SSH private keys, as described on this page
- Credentials embedded in a repository URL, see [Credentials in HTTPS repository URLs](#credentials-in-https-repository-urls)
- Docker registry credentials, see [Private Docker images](#private-docker-images)
- Values of usage scenario variables named `__GMT_VAR_SECRET_*__`. The API encrypts them when a run is submitted and the runner decrypts them just before it replaces them into the `usage_scenario.yml`. See [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario.md" >}})

If the Dashboard server has no `security.encryption_public_key_file` configured, the API refuses to store any of these secrets.
A runner without the matching `security.encryption_private_key_file` cannot decrypt them and fails every job that carries one. This includes all jobs of a user who has an SSH key or Docker registry credentials stored.

## Configure the web server to accept SSH keys from users

On the GMT Dashboard server, configure an RSA PEM-format public key in `config.yml`:

```yml
security:
  encryption_public_key_file: /var/www/green-metrics-tool/.rsa/public_key.pem
```

Create the RSA key pair with:

```bash
# Generate private key (2048-bit)
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# Extract public key
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

Recommended placement on the Dashboard server:

```bash
mkdir -p /var/www/green-metrics-tool/.rsa/
mv public_key.pem /var/www/green-metrics-tool/.rsa/public_key.pem
chmod 755 /var/www/green-metrics-tool/.rsa/public_key.pem
```

The file must be readable by the GMT API process. In the default container setup the Gunicorn container runs as root, and a restrictive mode such as `400` can make the mounted file unreadable inside the container. Use `755` for the public key file.

## Configure runners to use submitted SSH keys

On each runner that needs to execute jobs with user supplied SSH keys, configure the matching RSA PEM-format private key in `config.yml`:

```yml
security:
  encryption_private_key_file: /path/to/repo/rsa/private_key.pem
```

The private key must match the public key configured as `security.encryption_public_key_file` on the GMT Dashboard server. Keep this private key available only to runner or cluster machines that execute measurements and to administrators who need runner access.

## Allow users to save SSH keys

To submit an SSH key through the Dashboard, the user must be allowed to update the `ssh_private_key` setting. This is controlled through the user's `capabilities` JSON:

```json
{
  "user": {
    "updateable_settings": [
      "ssh_private_key"
    ]
  }
}
```

The Dashboard also needs access to the settings API routes:

```json
{
  "api": {
    "routes": [
      "/v1/user/setting",
      "/v1/user/settings"
    ]
  }
}
```

The default seeded user includes this capability. For existing or restricted users, add `ssh_private_key` to `user.updateable_settings`; otherwise the Dashboard will reject the setting update.

## Submit a user SSH key through the Dashboard

Users can add their repository SSH key in the Dashboard under:

```text
/settings.html
```

Paste an OpenSSH private key block into the SSH private key setting. This key is used by the runner for Git clone operations.

The Dashboard key should look like:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

After saving the setting, new measurements for private Git repositories can use the stored SSH key.

## Use an SSH key from the command line

When running a measurement directly with `runner.py`, pass the OpenSSH private key file with `--ssh-private-key`:

```bash
python3 runner.py \
  --uri git@github.com:example/private-repository.git \
  --filename usage_scenario.yml \
  --ssh-private-key ~/.ssh/id_ed25519
```

## Use the SSH URL, not the HTTPS URL

{{< callout context="caution" icon="outline/alert-triangle" >}}
When measuring a private repository with an SSH key you **must** supply the SSH URL (`git@github.com:owner/repo.git`), not the HTTPS URL (`https://github.com/owner/repo`). The SSH key configured in your settings is only used by the Git clone step; the HTTPS URL bypasses it and will fail with a "Could not find repository" error because the repository is not publicly accessible over HTTPS.
{{< /callout >}}

| Correct (SSH URL) | Wrong (HTTPS URL) |
|---|---|
| `git@github.com:myorg/myrepo.git` | `https://github.com/myorg/myrepo` |
| `git@gitlab.com:myorg/myrepo.git` | `https://gitlab.com/myorg/myrepo` |

You can copy the SSH URL from the repository's clone dialog on GitHub or GitLab by switching to the **SSH** tab.

For self-hosted Git servers an HTTPS URL with embedded credentials is an alternative to the SSH key. See [Credentials in HTTPS repository URLs](#credentials-in-https-repository-urls).

## Credentials in HTTPS repository URLs

Instead of an SSH key you can put credentials into an HTTPS repository URL. This example uses a username and an access token.

```text
https://username:access-token@git.example.com/myorg/myrepo.git
```

When such a URL is submitted through the Dashboard or the API, GMT takes the credentials out of the URL, encrypts them with `security.encryption_public_key_file` and stores the URL with the encrypted credentials in their place. This applies to the job and, for recurring schedule modes, also to the watchlist entry.

The runner decrypts the credentials with `security.encryption_private_key_file` and passes them to Git through environment variables and a `GIT_ASKPASS` helper script. They never appear on the `git clone` command line, where other users of the machine could read them with `ps`.
The run itself stores the URL without credentials. The `/v2/jobs` API route returns job URLs with the credentials replaced by `*****GMT-REDACTED*****`.

Before a job is accepted, GMT checks through the API of the Git host that the repository exists. For `github.com` and `gitlab.com` this check does not use the credentials from the URL, so a private repository on these hosts is normally rejected with the "Could not find repository" error. Use the SSH URL and an SSH key there.
For every other host GMT assumes a self-hosted GitLab instance. It sends the credentials along with the check and only logs an error if the API answers with an error status.

## Private Docker images

GMT can pull images from private Docker registries. The same credentials are also handed to Kaniko when GMT builds an image, so a `Dockerfile` can use a private base image in its `FROM` line.

Users store their registry logins in the `docker_credentials` setting. On the command line they can be passed as a file instead.

### Allow users to save Docker registry credentials

Like the SSH key, the setting must be listed in the user's `capabilities` JSON.

```json
{
  "user": {
    "updateable_settings": [
      "docker_credentials"
    ]
  }
}
```

The default seeded user includes it. The database migration that introduced the setting also added it to `user.updateable_settings` of every existing user, so existing users need no change. For users you create later, make sure the entry is present.
The Dashboard uses the same settings API routes as for the SSH key.

### Submit Docker registry credentials through the Dashboard

In `/settings.html` the **Docker registry credentials** setting takes one row per registry with the registry, a username and a password or access token. Use **Add registry** for more rows.
Saving replaces all stored credentials and **Clear** removes them. After saving, the Dashboard only shows whether credentials are stored and never displays them again.

The registry value becomes the key in the `auths` section of a Docker client `config.json`. Use the same registry name that `docker login` writes there, for example `registry.example.com`. For Docker Hub use `https://index.docker.io/v1/`.

The Dashboard server encrypts the credentials with `security.encryption_public_key_file` before it stores them. The runner decrypts them with `security.encryption_private_key_file` when it picks up a job of that user.

### Use Docker registry credentials from the command line

When running a measurement directly with `runner.py`, pass a JSON file with `--docker-credentials`. The file contains a list with one object per registry.

```json
[
  {"registry": "https://index.docker.io/v1/", "username": "myuser", "password": "my-access-token"},
  {"registry": "registry.example.com", "username": "ci", "password": "my-password"}
]
```

```bash
python3 runner.py \
  --uri /path/to/repository \
  --filename usage_scenario.yml \
  --docker-credentials ~/docker-credentials.json
```

GMT reads the file when it starts and does not store its contents with the run. See [Runner switches →]({{< relref "/docs/measuring/runner-switches.md" >}})

### How the credentials are used during a run

Before the images of the usage scenario are built or pulled, the runner writes the credentials into a temporary Docker client `config.json` inside the temporary folder of the run. Only the user running GMT can read this file. GMT does not run `docker login` and does not change the Docker configuration of the machine.

- `docker pull` reads the file through the `DOCKER_CONFIG` environment variable. While credentials are set, pulls therefore use only this file and not the machine's own `~/.docker/config.json`.
- Kaniko gets the file mounted read-only as `/kaniko/.docker/config.json`, so it can pull private base images. GMT runs Kaniko with `--no-push`, so the credentials are never used to push images.

The file is deleted during the cleanup at the end of the run and again before the next run starts. The credentials are also removed from the runner arguments that GMT stores with each run.

## Troubleshooting

- **Error: "Could not find repository … Is the repo publicly accessible, not empty and does the branch … exist?"**

This error appears when GMT cannot access the repository through the public API. The most common cause when using private repositories is supplying the HTTPS URL instead of the SSH URL. Switch to the SSH URL format (`git@github.com:owner/repo.git`) and retry.
