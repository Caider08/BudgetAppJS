//the IFFE
var budgetController = (function(){
    
    //when we want to create LOTS of objects...create function constructors
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(Iid, Idescription, Ivalue){
        this.id = Iid;
        this.description = Idescription;
        this.value = Ivalue;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
           sum += cur.value;
        });
        
        data.totals[type] = sum;
    };
    
     
    //so you don't have variables etc.. floating all over the place
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        
        budget: 0,
        //use -1 when something nonExistant
        percentage: -1,
    }
    
    //when you want to give another module access to something you need to return
    return{
        addItem: function(type, des, val){
            var newItem, ID;
            
            //create a new ID
            if(data.allItems[type] > 0){
            ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else{
                ID = 0;
            }
            
            //Create new item based on inc or exp type
            if(type === 'inc'){
                newItem = new Income(ID, des, val);
                
            }
            else{
                
                newItem = new Expense(ID, des, val);
            }
            
            //push it into data
            data.allItems[type].push(newItem);
            
            //return new element so other constructors can acess it 
            return newItem;
                    
        },
        
        deleteItem(type, id){
            
            console.log(type);
            
            var ids = data.allItems[type].map(function(cur){
                return cur.id;
                
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1 )
                {
                    //found it ...want to delete
                    //use splice to remove elements
                    //index, how many to delete 
                    data.allItems[type].splice(index,1);
                }
            
        },
        
        calculateBudget: function(){
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                
            
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
                
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function(){
            //map stores something in a variable and returns it
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            
            return allPerc;
        },
        
        getBudget: function(){
            return {
                
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage,
            }
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();

//these 2 are seperate from each other...Seperation of concerns
var UIController = (function() {
    
    //create a private object for storing all the strings from html
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        monthLabel: '.budget__title--month',
    };
    
          var formatNumber =  function(num, type){
            
            var numSplit, int, dec;
            //comma seperating the thouands
            //2 decimal points
            //+ or - before the number
            
            num = Math.abs(num);
            num = num.toFixed(2);//puts into 2 decimal places and converts to a string
            
            numSplit = num.split('.'); //split number and decimal parts of the string
            int = numSplit[0];
            
            if(int.length >3) {
               int = int.substr(0, int.length - 3) + "," + int.substr(int.length -3, 3);
                
               }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + "." + dec;
        };
    
        var nodeListForEach = function(list, callback){
               for (var i =0 ; i < list.length; i++){
                   console.log("and here");
                   callback(list[i], i);
               }
  
            };
    
    return {
      getinput: function() {
          
          return {
            type:  document.querySelector(DOMstrings.inputType).value,  //Will be either inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value),    
              
          }
      },
        
        addListItem: function(obj, type) {
          var html, newHtml, element;
            // Create HTML string with placeholder text
            if(type === 'inc'){
                
            element = DOMstrings.incomeContainer;
             html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else{
                
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));
            
            // Inser the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        
            
                    
        },
        
        deleteListItem: function(selectorID){
            //move up in the DOM(to the parent) AND then remove a child
            var el = document.getElementById(selectorID);
            
            el.parentNode.removeChild(el);         
        },
        
        clearFields: function(){
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            //convert list to an array using arraySlice (stored in prototype)
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(cur, index, arr) {            
                cur.value = "";
                
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
           
            
            if(obj.percentage > 0){
                 document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages){
            
            //will return a NodeList
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            var nodeListForEach = function(list, callback){
               for (var i =0 ; i < list.length; i++){
                   console.log("and here");
                   callback(list[i], i);
               }
  
            };
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0){
                current.textContent = percentages[index] + "%";
                    console.log("in here tooooo")
                   
                }else{
                    current.textContent = "yuck";
                    console.log('yuck');
                }
                
            });
            
        },
        
        displayMonth: function(){
          var now, year, month, months;
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            months = ['January', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.monthLabel). textContent = months[month] + ' ' + year;
        },
        
        changedType: function(){
            
        var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
        console.log(fields)
            
        console.log("we're here");
        
        nodeListForEach(fields, function(cur){
        
            cur.classList.toggle('red-focus');
        });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
          
        
    };
    
})();

//can pass other modules
//Globa APP controller
//IIFE funciton...(immediately invovked Function expression)
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListerners = function(){
        
    var DOM = UICtrl.getDOMstrings();
        
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
    //use keycode from console to get the correct key
    document.addEventListener('keypress', function(event){
       
        if (event.keyCode === 13 || event.which === 13)
        {
            ctrlAddItem();
        }
        
    });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        
        //1. Calculate the Budget
        budgetCtrl.calculateBudget();
        
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        
        //5. Display the budget on the UI
        UICtrl.displayBudget(budget);
      
        
    }
    
    var updatePercentages = function(){
      
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        
        
        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        
        
    }
    
    var ctrlAddItem = function(){
        
        var input, newItem;
        
        //1. Get the filled input data
        input = UICtrl.getinput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
           
           
        //2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        
        //clear the fields
        UICtrl.clearFields();
        
        //update budget
        updateBudget();
            
        //update%s
        updatePercentages();
        }
        
    }
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        //DOM traversal using parentNode
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            //inc-1
            //will return an array of the results of the split
            splitID = itemID.split('-');
            console.log(splitID);
            type = splitID[0];
            console.log(type);
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the Data
            budgetCtrl.deleteItem(type, ID);
            
            //2. remove it from U.I.
            UICtrl.deleteListItem(itemID);
            
            //3. update and show the new totals
            updateBudget();
            
            //
            updatePercentages();
            
        }
    }
    

    return{
        //to call the stuff we need right away
        init: function(){
            
            var starter
            
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1,
            });
            
            UICtrl.displayMonth();
            setupEventListerners();
        }
    };
    
//pass when calling it
})(budgetController, UIController);

//only code that goes outside the controller modules/wrappers
controller.init();

