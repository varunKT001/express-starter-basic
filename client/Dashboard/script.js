let USER = null;
let REFRESH = false;

const userName = document.querySelector('nav > h2');
const userImg = document.querySelector('nav > img');
const mailDataTable = document.querySelector('.mail-data');
const refreshButton = document.querySelector('.refresh-button');
const signOutButton = document.querySelector('.signout');

const getDataFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);

    if (!data) return [];

    return JSON.parse(data);
  } catch (error) {
    alert(error.message);
  }
};

const storeDataToLocalStorage = (key, data) => {
  try {
    const str = JSON.stringify(data);
    localStorage.setItem(key, str);
  } catch (error) {
    alert(error.message);
  }
};

const refreshMailData = async () => {
  try {
    REFRESH = true;

    const mailData = await getAnalyzedMailData();
    storeDataToLocalStorage('mailData', mailData);

    REFRESH = false;

    populateMailDataTable(mailData);
  } catch (error) {
    alert(error.message);
  }
};

const getAnalyzedMailData = async () => {
  try {
    if (!REFRESH) return [];

    const response = await fetch('/api/ai/analyzed-messages');
    const { data } = await response.json();

    REFRESH = false;

    if (!data) return [];

    return data;
  } catch (error) {
    alert(error.message);
  }
};

const populateMailDataTable = (data) => {
  if (data.length === 0) {
    const row = document.createElement('tr');

    const c1 = document.createElement('td');
    c1.setAttribute('rowspan', '4');

    c1.innerText = 'No data available!';
  }

  data.forEach((d, index) => {
    const row = document.createElement('tr');

    const c1 = document.createElement('td');
    const c2 = document.createElement('td');
    const c3 = document.createElement('td');
    const c4 = document.createElement('td');

    c1.innerText = index;
    c2.innerText = d.from;
    c3.innerHTML = d.snippet;
    c4.innerText = d.isInvestor ? 'Yes' : 'No';

    row.appendChild(c1);
    row.appendChild(c2);
    row.appendChild(c3);
    row.appendChild(c4);

    mailDataTable.appendChild(row);
  });
};

const logout = () => {
  storeDataToLocalStorage('mailData', []);
  window.location.href = 'http://localhost:5000/api/auth/logout';
};

window.onload = async () => {
  try {
    const resp = await fetch('/api/auth/profile');
    const { data } = await resp.json();

    if (!data) window.location.href = '/login';

    USER = data;

    userName.innerText = `Hi, ${USER.name}`;
    userImg.setAttribute('src', USER.picture);

    let mailData = getDataFromLocalStorage('mailData');

    populateMailDataTable(mailData);
  } catch (error) {
    alert(error.message);
  }
};

refreshButton.addEventListener('click', refreshMailData);
signOutButton.addEventListener('click', logout);
