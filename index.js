const core = require("@actions/core");
const github = require("@actions/github");
const request = require("request-promise-native");

try {
  const apiKey = process.env["TRELLO_API_KEY"];
  const apiToken = process.env["TRELLO_API_TOKEN"];

  moveCardWhenPullRequestClose(apiKey, apiToken);
} catch (error) {
  core.setFailed(error.message);
}

function moveCardWhenPullRequestClose(apiKey, apiToken) {
  const exitListId = process.env["TRELLO_DEPARTURE_LIST_ID"];
  const destinationListId = process.env["TRELLO_DESTINATION_LIST_ID"];
  const start = async () => {
    const branchName = "feature/branch-name-ky-232";
    const match = branchName.match(/-ky-(?<cardId>[0-9]*)/);
    const cardId = match.groups.cardId;

    const cards = await getCardsOfList(apiKey, apiToken, exitListId);

    cards
      .filter((card) => cardId === card.idShort.toString())
      .forEach((card) => {
        console.log(card);
        putCard(apiKey, apiToken, card.id, destinationListId);
      });
  };
  start();
}

function getCardsOfList(apiKey, apiToken, listId) {
  return new Promise(function (resolve, reject) {
    request(
      `https://api.trello.com/1/lists/${listId}/cards?key=${apiKey}&token=${apiToken}`
    )
      .then(function (body) {
        resolve(JSON.parse(body));
      })
      .catch(function (error) {
        reject(error);
      });
  });
}
function putCard(apiKey, apiToken, cardId, destinationListId) {
  const options = {
    method: "PUT",
    url: `https://api.trello.com/1/cards/${cardId}?key=${apiKey}&token=${apiToken}`,
    form: {
      idList: destinationListId,
    },
  };
  return new Promise(function (resolve, reject) {
    request(options)
      .then(function (body) {
        resolve(JSON.parse(body));
      })
      .catch(function (error) {
        reject(error);
      });
  });
}
