#!/bin/bash

echo "main"
git branch --remote --list | grep -v "main" | cut -c10-
git tag -l --sort=-version:refname "v*"

