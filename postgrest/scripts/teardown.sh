#!/bin/bash
dropdb -U postgres odys_dev --force
dropuser -U postgres anon
dropuser -U postgres authenticator
