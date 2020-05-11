pg-ssl
======

A function to parse libpq-style environment variables for node-postgres ssl configuration

## Usage

```
const { Pool } = require('pg')
const { parseSsl } = require('pg-ssl')

const pool = new Pool({
    ssl: parseSsl()
})
```

The resulting config contains the following properties:

- `ca` - contents of a SSL certificate authority (CA) certificate file if specified by `PGSSLROOTCERT`
- `cert` - contents of a client SSL certificate if specified by `PGSSLCERT`
- `key` - contents of the secret key used for the client SSL certificate if specified by `PGSSLKEY`
- `rejectUnauthorized` - defaults to true

## Why?

Although [node-postgres](https://github.com/brianc/node-postgres) supports environment variables like `PGHOST`, `PGUSER`, and `PGPASSWORD` that match the ones defined by [libpq](https://www.postgresql.org/docs/11/libpq-envars.html) it doesn't support SSL-related environment variables like `PGSSLMODE`, `PGSSLCERT`, `PGSSLKEY`, or `PGSSLROOTCERT`. These are useful, especially if you're connecting to cloud SQL databases requiring these parameters for a secure connection.

The `parseSsl` function looks to these environment variables to build an object that maps to the options for [tls.connect](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback), including support for `rejectUnauthorized`, `checkServerIdentity` and `servername`.

If you are getting an error message like `UNABLE_TO_VERIFY_LEAF_SIGNATURE` when connecting to your database, then this module can help you correctly set up your SSL parameters for node postgres.

## Options

Use options to override environment variables or specify custom options.

- `sslmode` - If set to `disabled`, returns `false`. Otherwise, try to parse other options. Defaults to `PGSSLMODE`.
- `sslrootcert` - The path to the root SSL certificate. Defaults to `PGSSLROOTCERT`.
- `sslcert` - The path to the client SSL certificate. Defaults to `PGSSLCERT`.
- `sslkey` - The path to the secret key for the client SSL certificate. Defaults to `PGSSLKEY`.
- `rejectUnauthorized` - If not `false`, the server certificate is verified against the supplied CAs. See [tls.connect](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback). Defaults to `true`.
- `servername` - Server name for the SNI (Server Name Indication) TLS extension. See [tls.connect](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback).
- `checkServerIdentity` - A callback function to be used (instead of the built-in one) when checking the server's host name against the certificate. See [tls.connect](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback).

## More Examples

For a Google Cloud SQL connection specify the [servername](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback) using the project ID `my-project` and the instance ID `my-sql-instance` to match the name specified by the client certificate, otherwise you'll receive `NODE_TLS_REJECT_UNAUTHORIZED`. Your environment would look like:

```
PGHOST=38.X.X.X
PGPORT=5432
PGUSER=my_user
PGPASSWORD=MyP@ssw0rd!
PGDATABASE=my_db
PGSSLMODE=verify-ca
PGSSLROOTCERT=/path/to/server-ca.pem
PGSSLCERT=/path/to/client-cert.pem
PGSSLKEY=/path/to/client-key.pem
```

And your Postgres would look like:

```
const pool = new Pool({
    ssl: parseSsl({
        servername: 'my-project/my-sql-instance'
    })
})
```

## Additional Details

If the `sslmode` option or `PGSSLMODE` environment variable is set to disabled, then `parseSsl` returns `false`.

Likewise, if neither `sslrootcert`/`PGSSLROOTCERT`, `sslcert`/`PGSSLCERT`, or `sslkey`/`PGSSLKEY` are specified, then `parseSsl` will return `false`.
