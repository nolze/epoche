import axios from 'axios';
import { formatISO } from 'date-fns';

import store from './store';

const basepath = window.basepath;
const wikiname = window.wikiname;

const api = axios.create({
  baseURL: '/api',
});

function formatTimestamp(dt) {
  return formatISO(dt);
}

const auth = {
  fetchUser: async function () {
    const user = await api
      .get('/auth/user')
      .then((resp) => resp.data)
      .catch((_err) => {
        // console.error(err);
        return null;
      });
    store.user.set(user);
  },
  signout: async function () {
    await api
      .get('/auth/signout')
      .then()
      .catch((err) => {
        console.error(err);
      });
    store.user.set(null);
  },
};

export { basepath, wikiname, api, formatTimestamp, auth };
