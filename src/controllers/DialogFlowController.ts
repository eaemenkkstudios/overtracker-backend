import { Request, Response } from 'express';
import { SessionsClient, v2 } from '@google-cloud/dialogflow';
import ScrapingController from './ScrapingController';

interface QueryResult {
  intent: {
    name: string;
    displayName: string;
  }
  parameters: {
    [key: string]: string | number | boolean;
  }
}

class DialogFlowController {
  private projectId: string;

  private sessionsClient: v2.SessionsClient;

  constructor() {
    const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g, '\n');
    this.projectId = process.env.DIALOGFLOW_PROJECT_ID || '';
    this.sessionsClient = new SessionsClient({
      credentials: {
        client_email: process.env.DIALOGFLOW_EMAIL,
        private_key: privateKey,
      },
    });
  }

  public sendMessage = async (req: Request, res: Response): Promise<Response> => {
    const { message }: { message: string; } = req.body;
    const { sessionID } = req;
    if (!req.user) return res.status(400).send();
    const { battletag } = req.user as { battletag: string };
    const tag = battletag.split('#')[0];
    const sessionPath = this.sessionsClient.projectAgentSessionPath(this.projectId, sessionID || '');

    const response = await this.sessionsClient.detectIntent({
      session: sessionPath,
      queryInput: {
        text: {
          text: `${message} ${tag}`,
          languageCode: 'en',
        },
      },
    });
    return res.json({
      message: response[0].queryResult?.fulfillmentText,
      date: new Date().getTime(),
    });
  }

  public async webhook(req: Request, res: Response): Promise<Response> {
    const { intent, parameters }: QueryResult = req.body.queryResult;

    let response = 'Sorry, I\'m having some technical difficulties with your information request.';

    if (intent.displayName === 'heroes') {
      const heroes = await ScrapingController.getAllHeroesScraping();
      if (heroes) {
        response = `Currently, there are ${heroes.length} heroes in Overwatch! They are: `;
        heroes.forEach((e, i) => {
          if (i + 2 < heroes.length) {
            response = response.concat(`${e.friendlyName}, `);
          } else if (i + 2 === heroes.length) {
            response = response.concat(`${e.friendlyName} and `);
          } else {
            response = response.concat(`${e.friendlyName}.`);
          }
        });
      }
    } else if (intent.displayName === 'workshop') {
      const code = await ScrapingController.getRandomWorkshopCodeScraping();
      if (code) {
        response = `Here you go! ${code.name} - ${code.code}.`;
      }
    } else if (intent.displayName === 'updates') {
      const updates = await ScrapingController.getLatestHeroesUpdateScraping();
      if (updates) {
        response = 'Here are the latest heroes nerfs/buffs:\n';
      }
      if (updates) {
        updates.forEach((update) => {
          response = response.concat(`\t${update.hero}:\n`);

          if (update.general.length > 0) {
            update.general.forEach((generalUpdate) => {
              response = response.concat(`\t\t${generalUpdate};\n`);
            });
          }

          update.abilities.forEach((ability) => {
            response = response.concat(`\t\t${ability.title}:\n`);
            ability.updates.forEach((abilityUpdate) => {
              response = response.concat(`\t\t\t${abilityUpdate.title}:\n`);
              abilityUpdate.updates.forEach((subUpdate) => {
                response = response.concat(`\t\t\t\t${subUpdate};\n`);
              });
            });
          });
        });
      }
    }

    return res.json({
      fulfillmentText: response,
      source: 'webhook',
    });
  }
}

export default new DialogFlowController();
