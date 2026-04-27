---
title: "SSH Keys"
description: "Configure user supplied SSH keys for private repository measurements"
date: 2026-04-27T00:00:00+00:00
weight: 1006
---

GMT can use SSH keys submitted by users through the Dashboard or the command line when measuring private Git repositories in a cluster setup.

There are two different key types involved, and they are used on different machines:

- The GMT web/API server uses an RSA PEM public key configured in `config.yml` to encrypt user supplied SSH keys before storing them.
- Each runner or cluster machine that executes measurements uses the matching RSA PEM private key configured in `config.yml` to decrypt the stored SSH key before cloning a repository.
- The user submits an OpenSSH private key through the Dashboard or command line. This is the key used by Git, through ssh, when cloning the measured repository.

We do this so that when the GMT Web machine or the database is leaked we do not expose any SSH keys.

Do not mix these formats. The encryption keys configured in `config.yml` must be RSA PEM files. The user supplied SSH key submitted through the Dashboard or passed on the command line must be an OpenSSH private key block.

## Configure the web server to accept SSH keys from users

On the GMT web/API server, configure an RSA PEM-format public key in `config.yml`:

```yml
security:
  encryption_public_key_file: ./.rsa/public_key.pem
```

Create the RSA key pair with:

```bash
# Generate private key (2048-bit)
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# Extract public key
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

Recommended placement on the web/API server:

```bash
mkdir -p ./.rsa
mv public_key.pem ./.rsa/public_key.pem
chmod 755 ./.rsa/public_key.pem
```

The file must be readable by the GMT API process. In the default container setup the Gunicorn container runs as root, and a restrictive mode such as `400` can make the mounted file unreadable inside the container. Use `755` for the public key file.

## Configure runners to use submitted SSH keys

On each runner that needs to execute jobs with user supplied SSH keys, configure the matching RSA PEM-format private key in `config.yml`:

```yml
security:
  encryption_private_key_file: ./.rsa/private_key.pem
```

The private key must match the public key configured as `security.encryption_public_key_file` on the GMT web/API server. Keep this private key available only to runner or cluster machines that execute measurements and to administrators who need runner access.

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
