An ini format parser and serializer for node.

A fork of [npm/ini](https://github.com/npm/ini) with adaptations to be
more compatible with the Windows API ini functions.

Changes from the original library:

* `encode`
  * Array keys are written with indices, e.g. `k[0]`, `k[1]`, etc.
    instead of using `k[]` for all items.
  * `safe` for escaping values is greatly simplified. Newlines are
    replaced with spaces, no other characters are escaped, and quotes
    are added when needed.
* `decode`
  * Section lines can have leading and trailing spaces.
  * Lines starting with `#` aren't treated as comments.
  * Empty lines are ignored.
  * No special treatment for array keys.
  * All values are treated as strings (no special treatment for
    `true`, `false` and `null`).
  * `unsafe` for unescaping values is greatly simplified. No
    characters are unescaped, and comments aren't supported.

Sections are treated as nested objects.  Items before the first
heading are saved on the object directly.

## Usage

Consider an ini-file `config.ini` that looks like this:
```ini
    ; this comment is being ignored
    scope = global

    [database]
    user = dbuser
    password = dbpassword
    database = use_this_database

    [paths.default]
    datadir = /var/lib/data
```

You can read, manipulate and write the ini-file like so:

```js
    var fs = require('fs')
      , ini = require('ini')

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))

    config.scope = 'local'
    config.database.database = 'use_another_database'
    config.paths.default.tmpdir = '/tmp'
    delete config.paths.default.datadir

    fs.writeFileSync('./config_modified.ini', ini.stringify(config, { section: 'section' }))
```

This will result in a file called `config_modified.ini` being written
to the filesystem with the following content:

```ini
    [section]
    scope=local
    [section.database]
    user=dbuser
    password=dbpassword
    database=use_another_database
    [section.paths.default]
    tmpdir=/tmp
```

## API

### decode(inistring)

Decode the ini-style formatted `inistring` into a nested object.

### parse(inistring)

Alias for `decode(inistring)`

### encode(object, [options])

Encode the object `object` into an ini-style formatted string. If the
optional parameter `section` is given, then all top-level properties
of the object are put into this section and the `section`-string is
prepended to all sub-sections, see the usage example above.

The `options` object may contain the following:

* `section` A string which will be the first `section` in the encoded
  ini data.  Defaults to none.
* `whitespace` Boolean to specify whether to put whitespace around the
  `=` character.  By default, whitespace is omitted, to be friendly to
  some persnickety old parsers that don't tolerate it well.  But some
  find that it's more human-readable and pretty with the whitespace.

For backwards compatibility reasons, if a `string` options is passed
in, then it is assumed to be the `section` value.

### stringify(object, [options])

Alias for `encode(object, [options])`

### safe(val)

Escapes the string `val` such that it is safe to be used as a key or
value in an ini-file. Basically adds quotes if needed. For example

```js
    ini.safe('"unsafe string"')
```

would result in

    ""unsafe string""

### unsafe(val)

Unescapes the string `val`
