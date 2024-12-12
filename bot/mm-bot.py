import json
import sys

from mmpy_bot import Bot, Settings
from plugin import SearchPlugin

try:
    with open('config.json', 'r', encoding='utf-8') as config:
        settings = json.loads(config.read())['wiki-search-bot']
except IOError as e:
    print(f'Unable to read config! Reason: {e}')
    sys.exit(1)

bot = Bot(
    settings=Settings(
        MATTERMOST_URL=settings['mattermost_host'],
        MATTERMOST_PORT=settings['mattermost_port'],
        MATTERMOST_API_PATH='/api/v4',
        BOT_TOKEN=settings['mattermost_token'],
        BOT_TEAM=settings['team_name'],
        SSL_VERIFY=False,
        WEBHOOK_HOST_ENABLED=True,
        WEBHOOK_HOST_URL=settings['webhook_host'],
        WEBHOOK_HOST_PORT=settings['webhook_self_port'],
    ),
    plugins=[SearchPlugin()],
)
bot.run()