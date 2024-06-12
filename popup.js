// se lance au chargement de l'extension (ouverture du navigateur)
document.addEventListener('DOMContentLoaded', function() {
    let addButton = document.getElementById('addButton');
    let validItemButton = document.getElementById('validButton');
    let itemNameInput = document.getElementById('newNameInput');
    let itemPriceInput = document.getElementById('newPriceInput');
    let shoppingList = document.getElementById('shoppingList');
    
    // Récupérer la précédente liste (s'il y a) depuis LocalStorage et la mettre sous forme de tableau
    let saved = JSON.parse(localStorage.getItem('localStoredItems')) || []
    let savedItems = Array.from(saved)      
    
    // Afficher les éléments déjà enregistrés dans la liste
    for (let i = 0; i < savedItems.length; i++) {
        createBubble(savedItems[i], savedItems);
    }

    diplayTotal(savedItems);
    addButtonClick(addButton);

    // se lance au click sur le "✅"
    validItemButton.addEventListener('click', function() {
        let newItem = {
            name: itemNameInput.value,
            price: itemPriceInput.value,
            url: ""
        };
        parsePrice(newItem);
        if (newItem.name !== '' && (!newItem.price || (newItem.price !== '' && newItem.price >= 0))) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                let activeTab = tabs[0];
                newItem.url = activeTab.url;
                createBubble(newItem, savedItems);
                document.getElementById('champs').style.display = 'none';
                document.getElementById('totalDiv').style.display = 'block';
                savedItems.push(newItem);
                // Ajouter le nouvel element a la liste d'achats enregistrés dans LocalStorage
                localStorage.setItem('localStoredItems', JSON.stringify(savedItems));
                // Effacer le champ de texte
                itemNameInput.value = '';
                itemPriceInput.value = '';
                diplayTotal(savedItems)
            });
        }
    });
});

function addButtonClick(addButton) {
    addButton.addEventListener('click', function () {
        let fields = document.getElementById('champs');
        let totalDiv = document.getElementById('totalDiv');
        if (fields.style.display === 'none') {
            fields.style.display = 'block';
            totalDiv.style.display = 'none';
        } else {
            fields.style.display = 'none';
            totalDiv.style.display = 'block';
        }
    });
}

function parsePrice(newItem) {
    newItem.price = newItem.price.replace(/,/g, '.');
    if (!isNaN(newItem.price)) {
        newItem.price = parseFloat(newItem.price);
        newItem.price = newItem.price.toFixed(2);
        newItem.price = parseFloat(newItem.price);
    }
}

function createBubble(item, itemsArray) {
    let newBubble = document.createElement('div');
    newBubble.className = "bulle";
    if(!item.price) {
        newBubble.innerHTML = '<p><a target="_blank" href="' + item.url + '">' + item.name.substring(0, 21) + '</a><br></p><p><button class="deleteButton">🗑️</button></p>';
    } else {
        newBubble.innerHTML = '<p><a target="_blank" href="' + item.url + '">' + item.name.substring(0, 21) + '</a><br>' + item.price + ' €</p><p><button class="modifyButton">✏️</button> <button class="deleteButton">🗑️</button></p>';
    }
    shoppingList.appendChild(newBubble);
    let deleteButton = newBubble.querySelector('.deleteButton')
    // Permet de supprimer la bulle et le stockage de l'élément associé au clic de chacune des 🗑️
    deleteButtonClick(deleteButton, newBubble, itemsArray, item);
}

function deleteButtonClick(deleteButton, newBubble, itemsArray, item) {
    deleteButton.addEventListener('click', function () {
        shoppingList.removeChild(newBubble);
        itemsArray.splice(itemsArray.findIndex(savedItem => savedItem.name === item.name && savedItem.price === item.price), 1);
        localStorage.setItem('localStoredItems', JSON.stringify(itemsArray));
        diplayTotal(itemsArray);
    });
}

function sumPrices (priceArray) {
    let total = 0
    for (let i = 0; i < priceArray.length; i++) {
        if (isNaN(priceArray[i].price)) {
            priceArray[i].price = 0
        }
        total += priceArray[i].price
    }
    return total
}

function diplayTotal (priceArray) {
    let total = sumPrices(priceArray).toFixed(2);
    document.getElementById('Total').innerHTML = total + ' €';
}
