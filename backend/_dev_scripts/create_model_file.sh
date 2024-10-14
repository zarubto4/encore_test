#!/bin/bash

# Ensure the script exits on error and treats unset variables as errors
set -euo pipefail

# Check if the user provided input/output files and a secret value
if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <input_file.ts> <output_file.ts> <secret_value>"
  exit 1
fi

input_file=$1
output_file=$2
secret_value=$3

# Create a copy of the TypeScript file
cp "$input_file" "$output_file"

# Use sed to replace all occurrences of {secret} with the provided secret value
sed -i "s/{secret}/$secret_value/g" "$output_file"

echo "Replaced {secret} with '$secret_value' in $output_file"
