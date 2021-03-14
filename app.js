// Storage controller
const StorageCtrl = (function() {

    return {
        storeItemToStorage : function(item) {
            console.log(item);
            let items = [];

            if(localStorage.getItem("items") === null) {
                items.push(item);
            } else {
                items = JSON.parse(localStorage.getItem("items"));

                items.push(item);
            }

            localStorage.setItem('items', JSON.stringify(items));
        },
        getItemFromStorage : function() {
            let items;

            if(localStorage.getItem("items") === null) {
                items = [];
            } else {
                items = JSON.parse(localStorage.getItem("items"));
            }

            return items;            
        },
        updateStorageItem : function(updatedItem) {
            const items = this.getItemFromStorage();

            items.forEach(item => {
                if(item.id === updatedItem.id) {
                    item.name = updatedItem.name;
                    item.calories = updatedItem.calories;
                }
            });

            localStorage.setItem("items", JSON.stringify(items));
        },
        deleteItemFromStorage : function(deletedItem) {
            const items = this.getItemFromStorage();

            items.forEach((item, index) => {
                if(item.id === deletedItem.id) {
                    items.splice(index, 1);
                }
            });

            localStorage.setItem("items", JSON.stringify(items));
        },
        clearAllItemsFromStorage : function() {
            localStorage.clear();
        }
    }

})();

// Item controller
const ItemCtrl = (function() {
    // Item constructor
    const Item = function(id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    }

    // Item list 
    let items = StorageCtrl.getItemFromStorage();

    // Data structure for items
    const data = {
        items : items,
        currentItem : null,
        totalCalories : 0
    };

    return {
        getItems : function() {
            return data.items;
        },
        addItem : function(itemName, itemCalories) {
            let ID;

            if(data.items.length > 0) {
                ID = data.items[data.items.length - 1].id + 1;
            } else {
                ID = 0;
            }

            const calories = parseInt(itemCalories);

            const newItem = new Item(ID, itemName, calories);

            data.items.push(newItem);

            return newItem;
        },
        getTotalCalories : function() {
            let totalCalories = 0;

            data.items.forEach(item => {
                totalCalories += item.calories;
            });

            data.totalCalories = totalCalories;

            return totalCalories;

        },
        logData : function() {
            console.log(data);
        },
        getItemById : function(id) {
            let matchedItem = null;

            data.items.forEach(item => {
                if(item.id === id) {
                    matchedItem = item;
                }
            });

            return matchedItem;
        },
        setCurrentItem : function(item) {
            data.currentItem = item;
        },
        getCurrentItem : function() {
            return data.currentItem;
        },
        updateMeal : function(updateItem) {
            let found;
            let currentItemId = data.currentItem.id;

            data.items.forEach(item => {
                if(item.id === currentItemId) {
                    item.name = updateItem.meal;
                    item.calories = parseInt(updateItem.calories);
                    found = item;
                }
            })

            data.items.currentItem = null;

            UICtrl.populateItems(data.items);

            return found;
        },
        deleteMeal : function() {
            let found;
            let currentItem = data.currentItem;

            data.items = data.items.filter(item => {
                if(item.id !== currentItem.id) {
                    return item;
                } else {
                    found = item;
                }
            });

            data.currentItem = null;

            UICtrl.populateItems(data.items);

            return found;
        },
        removeAllItems : function() {
            data.items = [];
            data.currentItem = null;
            data.totalCalories = 0;

            // Populate list
            UICtrl.populateItems(data.items);
        }
    }
})();


// UI controller
const UICtrl = (function() {
    // UI selectors list
    const UISelectors = {
        itemList : "#item-list",
        addMealBtn : "#add-meal",
        mealInput : "#meal",
        caloriesInput : "#calories",
        totalCalories : "#total-calories",
        editBtns : "#edit-btns",
        addBtn : "#add-btn",
        editBtn : ".edit-btn",
        updateMeal : "#update-meal",
        deleteMeal : "#delete-meal",
        backBtn : "#back-btn",
        clearBtn : "#clear-btn"
    }
    // populate items
    const populateItems = function(items) {
        let output = "";

        items.forEach((item, index) => {
            output += `<tr id="item-${item.id}">
            <th scope="row">${index + 1}</th>
            <td>${item.name}</td>
            <td>${item.calories}</td>
            <td><i class="edit-btn fas fa-pencil-alt"  style="cursor:pointer;"></i></td>
          </tr>`
        });

        document.querySelector(UISelectors.itemList).innerHTML = output;
    };

    return {
        populateItems,
        UISelectors,
        getInput : function() {
            return {
                meal : document.querySelector(UISelectors.mealInput).value,
                calories : document.querySelector(UISelectors.caloriesInput).value
            }
        },
        addToList : function(item) {
            let lengthOfItems = document.querySelectorAll("tr").length;

            let tr = document.createElement("tr");

            let output = `
                    <th scope="row">${lengthOfItems}</th>
                    <td>${item.name}</td>
                    <td>${item.calories}</td>
                    <td ><i class="fas fa-pencil-alt edit-btn" style="cursor:pointer;"></i></td>`
            
            tr.id = `item-${item.id}`;
            
            tr.innerHTML = output;

            document.querySelector(UISelectors.itemList).insertAdjacentElement("beforeend", tr);

        },
        showTotalCalories : function() {
            const totalCalories = ItemCtrl.getTotalCalories();

            document.querySelector(UISelectors.totalCalories).innerHTML = totalCalories;
        },
        clearInputFields : function() {
            document.querySelector(UISelectors.mealInput).value = "";
            document.querySelector(UISelectors.caloriesInput).value = "";
        },
        clearEditState : function() {
            UICtrl.clearInputFields();

            document.querySelector(UISelectors.addBtn).style.display = "inline";
            document.querySelector(UISelectors.editBtns).style.display = "none";
        },
        showEditState : function() {
            document.querySelector(UISelectors.addBtn).style.display = "none";
            document.querySelector(UISelectors.editBtns).style.display = "inline";
        },
        updateInputDetails : function() {
            let itemToEdit = ItemCtrl.getCurrentItem();

            document.querySelector(UISelectors.mealInput).value = itemToEdit.name;

            document.querySelector(UISelectors.caloriesInput).value = itemToEdit.calories;

        }
    }

})();

// App controller
const AppCtrl = (function(ItemCtrl, StorageCtrl, UICtrl) {
    const loadEventListeners = function() {
        // Add meal button
        document.querySelector(UICtrl.UISelectors.addMealBtn).addEventListener("click", addMealSubmit);

        // Edit button
        document.querySelector(UICtrl.UISelectors.itemList).addEventListener("click", showEditState);

        // Disable enter button
        document.addEventListener("keypress", function(e) {
            if(e.key === "Enter") {
                e.preventDefault();
                return false;
            }
        })

        // Update button event listener
        document.querySelector(UICtrl.UISelectors.updateMeal).addEventListener("click", updateMealSubmit);

        // Delete meal button
        document.querySelector(UICtrl.UISelectors.deleteMeal).addEventListener("click", deleteMeal);

        // Back button 
        document.querySelector(UICtrl.UISelectors.backBtn).addEventListener("click", backToMain);

        // Clear button
        document.querySelector(UICtrl.UISelectors.clearBtn).addEventListener("click", clearAllItems);

    };

    // Clear all items
    function clearAllItems(e) {
        e.preventDefault();

        // Clear all items from data structure
        ItemCtrl.removeAllItems();

        // Clear all items from storage
        StorageCtrl.clearAllItemsFromStorage();

        // Update list
        UICtrl.showTotalCalories();

        // clear edit state
        UICtrl.clearEditState();

        // clear input fields
        UICtrl.clearInputFields();

    }

    // Back to main
    function backToMain(e) {
        e.preventDefault();

        // Clear edit state
        UICtrl.clearEditState();

    }

    // Delete meal
    function deleteMeal(e) {
        e.preventDefault();

        let deletedItem = ItemCtrl.deleteMeal();

        // Delete from storage
        StorageCtrl.deleteItemFromStorage(deletedItem);

        // update total calories
        UICtrl.showTotalCalories();

        // Clear input fields
        UICtrl.clearInputFields();

        // Clear edit state
        UICtrl.clearEditState();

    };

    // Update meal submit 
    function updateMealSubmit(e) {
        e.preventDefault();

        let newItem = UICtrl.getInput();

        // Update item
        let updatedItem = ItemCtrl.updateMeal(newItem);

        // Update item in storage
        StorageCtrl.updateStorageItem(updatedItem);

        // Update total calories
        UICtrl.showTotalCalories();
        
        // Clear input fiels
        UICtrl.clearInputFields();

        // Clear edit state
        UICtrl.clearEditState();


    }

    function showEditState(e) {
        e.preventDefault();

        if(e.target.classList.contains("edit-btn")) {
            // show edit state
            UICtrl.showEditState();

            let idValue = e.target.parentNode.parentNode.id;
            idValue = idValue.split("-");

            const id = parseInt(idValue[1]);

            // get item by id
            const itemToEdit = ItemCtrl.getItemById(id);

            console.log(itemToEdit);

            // Assign Current item in data structure
            ItemCtrl.setCurrentItem(itemToEdit);

            // details to be updated
            UICtrl.updateInputDetails();

            
        }

    }

    function addMealSubmit(e) {
        e.preventDefault();

        // Getting new item
        let newItem = UICtrl.getInput();

        // Add item to data structure
        newItem = ItemCtrl.addItem(newItem.meal, newItem.calories);

        console.log(newItem);

        // Add to local storage
        StorageCtrl.storeItemToStorage(newItem);

        // Add new item to list
        UICtrl.addToList(newItem);

        // Show total Calories
        UICtrl.showTotalCalories();

        // Clear input fields
        UICtrl.clearInputFields();

    };

    return {
        init : function() {
            // Clear edit state
            UICtrl.clearEditState();

            // Fetching items
            const items = ItemCtrl.getItems();

            // Populating items in UI
            UICtrl.populateItems(items);

            // Show total Calories
            UICtrl.showTotalCalories();

            // load all event listeners
            loadEventListeners();
        }
    }

})(ItemCtrl, StorageCtrl, UICtrl);

AppCtrl.init();

