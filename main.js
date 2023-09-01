'use strict'

const openModal = () => document.getElementById('modal')
    .classList.add('active')

const closeModal = () => {
    clearFields()
    document.getElementById('modal').classList.remove('active')
}


const getLocalStorage = () => JSON.parse(localStorage.getItem('db_client')) ?? []
const setLocalStorage = (dbClient) => localStorage.setItem("db_client", JSON.stringify(dbClient))

// CRUD - create read update delete
const deleteClient = (index) => {
    const dbClient = readClient()
    dbClient.splice(index, 1)
    setLocalStorage(dbClient)
}

const updateClient = (index, client) => {
    const dbClient = readClient()
    dbClient[index] = client
    setLocalStorage(dbClient)
}

const readClient = () => getLocalStorage()

const createClient = (client) => {
    const dbClient = getLocalStorage()
    dbClient.push (client)
    setLocalStorage(dbClient)
}

const isValidFields = () => {
    return document.getElementById('form').reportValidity()
}

//Interação com o layout

const clearFields = () => {
    const fields = document.querySelectorAll('.modal-field')
    fields.forEach(field => field.value = "")
    document.getElementById('nome').dataset.index = 'new'
}

const saveClient = () => {
    //debugger
    if (isValidFields()) {
        const client = {
            nome: document.getElementById('nome').value,
            remetente: document.getElementById('remetente').value,
            destinatário: document.getElementById('destinatário').value,
            pagador: document.getElementById('pagador').value,
            status: document.getElementById('status').value,
            file: document.getElementById('file').value.split('\\').slice(-1).pop()
        }
        const index = document.getElementById('nome').dataset.index
        if (index == 'new') {
            createClient(client)
            updateTable()
            closeModal()
        } else {
            updateClient(index, client)
            updateTable()
            closeModal()
        }
    }
}

const createRow = (client, index) => {
    const newRow = document.createElement('tr')
    newRow.innerHTML = `
        <td>${client.nome}</td>
        <td>${client.remetente}</td>
        <td>${client.destinatário}</td>
        <td>${client.pagador}</td>
        <td>${makeDrop(client.status,index)}</td>
        <td>
            <button type="button" class="button blue" id="edit-${index}">Editar</button>
            <button type="button" class="button blue" id="delete-${index}" >Excluir</button>
            <button type="button" class="button grey" id="download-${index}" >Gerar PDF</button>
        </td>
    `
    document.querySelector('#tableClient>tbody').appendChild(newRow)
}

function makeDrop(status,index) {
    let obj = {"Aguardando": 1,"Em Emissão": 2,"Emitido": 3,"Inativo": 4};
    let selectcode = '';
    selectcode += '<label class="select" for="status"><select id="status" class="custom-select" onchange="updateStatus(this.value,'+index+');">';
    for (var prop in obj) {
        selectcode += '<option value="' + obj[prop] + '"';
            if(obj[prop] == status) {
                selectcode += ' selected';
            }
        selectcode += '>' + prop + '</option>';
    }
    selectcode += '</select><svg><use xlink:href="#select-arrow-down"></use></svg></label>';
    return selectcode;
}

function updateStatus(value,index) {
    const dbClient = readClient()
    const client = {
        nome: dbClient[index]['nome'],
        remetente: dbClient[index]['remetente'],
        destinatário: dbClient[index]['destinatário'],
        pagador: dbClient[index]['pagador'],
        status: value,
        file: dbClient[index]['file']
    }
    updateClient(index, client)
    updateTable()
}

function clearTable() {
    const rows = document.querySelectorAll('#tableClient>tbody tr')
    rows.forEach(row => row.parentNode.removeChild(row))
}

const updateTable = () => {
    const dbClient = readClient()
    clearTable()
    dbClient.forEach(createRow)
}

const fillFields = (client) => {
    document.getElementById('nome').value = client.nome
    document.getElementById('remetente').value = client.pagador
    document.getElementById('destinatário').value = client.destinatário
    document.getElementById('pagador').value = client.pagador
    document.getElementById('status').value = client.status
    document.getElementById('nome').dataset.index = client.index
}

const editClient = (index) => {
    const client = readClient()[index]
    client.index = index
    fillFields(client)
    openModal()
}

const editDelete = (event) => {
    if (event.target.type == 'button') {

        const [action, index] = event.target.id.split('-')

        switch (action) {
            case 'edit':
                editClient(index)
                break;
            case 'delete':
                const client = readClient()[index]
                const response = confirm(`Deseja realmente excluir ${client.nome}`)
                if (response) {
                    deleteClient(index)
                    updateTable()
                }
                break;
            case 'download':
                const dbClient = readClient()
                window.open('arquivos/'+dbClient[index]['file'], '_blank');
                console.log(dbClient[index]['file']);
                break;
        }
    }
}

updateTable()

document.getElementById('cadastrarCliente')
    .addEventListener('click', openModal)

document.getElementById('modalClose')
    .addEventListener('click', closeModal)

document.getElementById('salvar')
    .addEventListener('click', saveClient)

document.querySelector('#tableClient>tbody')
    .addEventListener('click', editDelete)

document.getElementById('cancelar')
    .addEventListener('click', closeModal)