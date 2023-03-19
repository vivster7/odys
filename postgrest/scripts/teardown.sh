#!/bin/bash
dropdb -U postgres odys_dev --force || true
dropuser -U postgres anon || true
dropuser -U postgres authenticator || true
