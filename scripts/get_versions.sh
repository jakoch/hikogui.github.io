#!/bin/bash

echo "main"
git branch --list | cut -c3- | grep -v "main"
git tag -l --sort=-version:refname "v*"

