 #!/bin/bash

scriptPath=$(dirname "$(readlink -f "$0")")
. "${scriptPath}/.env.sh"
printenv

/usr/local/bin/python3.6 /code/pay_provider.py
