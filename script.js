var DOMstrigs = {
  inputType: '.add__type',
  inputDescription: '.add__description',
  inputValue: '.add__value',
  inputBtn: '.add__btn',
  incomeContainer: '.income__list',
  expensesContainer:'.expenses__list',
  budgetLabel: '.budget__value',
  incLabel: '.budget__income--value',
  expLabel: '.budget__expenses--value',
  dateLabel: '.budget__title--month',
  pourcentageLabel: '.budget__expenses--percentage',
  expPourcentageLabel: '.item__percentage',
  container: '.container' 
}


// Budget controller 
var budgetControler = (function() {
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.pourcentage = -1;
  }; // ICI COMMENCE LES METHODE STOCKER DANS LE PROTOTYPE 
  Expense.prototype.calcPourcentage = function(totalIncome) {
    if (totalIncome > 0){
      this.pourcentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.pourcentage = -1;
    }
  };
  Expense.prototype.getPourcentage = function () {
    return this.pourcentage;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
      sum = sum + cur.value;
      // on peut l'ecrire aussi comme ca 
      // sum += cur.value;
    });
    data.totals[type] = sum;
  }

  var data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    pourcentage: -1 // -1 signifie que ca n'existe pas encore alors que 0 peut etre considerer comme valeur 
  }

  return {
    addItem: function(type, des, val){
      var newItem;

      // Creat new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length -1].id + 1;
      }else{
        ID = 0;
      }
      // Creat new item based on inc or exp type 
      if (type === 'exp'){
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc'){
        newItem = new Income(ID, des, val);
      }

      // push it into our data structure 
      data.allItems[type].push(newItem);
      
      // return the new element
      return newItem;
    },

    deleteItem: function(type, ID){
      var IDs, index;
      IDs = data.allItems[type].map(function(current) {
        return current.id; //MAP cree un vecteur et chaque current sera l'id de l'objet du vecteur data.allItem[type]
      });

      index = IDs.indexOf(ID); //indexOf donne l'emplacement de la valeur qu'on veut dans le vecteur 

      //on retir que si on trouve l'emplacement de l'ID car sinon la valeur de index sera -1 par defaut 

      if (index !== -1){
        data.allItems[type].splice(index, 1); // splice retire un element du vecteur en prenons la position et combien d'element d'ou le 1
      }
    },

    calculateBudget: function() {
      // calculate total income and expenses

      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget income- expenses 

      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage

      if (data.totals.inc > 0) {
        data.pourcentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.pourcentage = -1;
      }
    },

    calculatePourcentages: function() {
      data.allItems.exp.forEach(function(current){
        current.calcPourcentage(data.totals.inc);
      });
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        pourcentage: data.pourcentage
      }
    },
    getPourcentage: function (){
      var allpourcentages = data.allItems.exp.map(function(current){
        return current.getPourcentage();
      });
      return allpourcentages;
    },
    
    testing: function() {
      console.log(data);
    }
  }
})();


// UI controler 
var UIControler = (function(){

  var formatNumber = function(num, type){
    var numSplit, int, dec, sign;
    num = Math.abs(num);
    num = num.toFixed(2); // toFixed(n) c'est une methode de chiffre et ca veut dire arrondir a n pres apres la virgule en format String 

    numSplit = num.split('.'); //split separe le contenu en n part tout dependement du break point qu'on lui donne dans les ()
    
    int = numSplit[0]; // etant donne que c'est un string on peut avoir la propriete length 
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //.substr(position a partir du tout debut, combien de pas)
    }

    dec = numSplit[1];

    if(type === 'exp'){
      sign = '- ';
    } else if (type === 'inc'){
      sign = '+ ';
    }

    return sign + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback){
    for(var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
  };

  return {
    getInPut: function(){
      return {
        type: document.querySelector(DOMstrigs.inputType).value, //+ ou - en argent
        description: document.querySelector(DOMstrigs.inputDescription).value, // description du montant
        value: parseFloat(document.querySelector(DOMstrigs.inputValue).value)
      };
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
     
      // craet HTML strings whti placeholder text
      
      if(type === 'inc'){
        element = DOMstrigs.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }else if (type === 'exp'){
        element = DOMstrigs.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      // replace the placeholder texte with some actual data

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // insert the html into the DOM
      
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID){

      var el =  document.getElementById(selectorID);
      // il faut dabord aller au parent pour utiliser removeChild
      el.parentNode.removeChild(el);
    },
    
    clearFields: function(){
      var fields, fieldsArray;

      fields = document.querySelectorAll(DOMstrigs.inputValue + ', ' + DOMstrigs.inputDescription);

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array){
        current.value = "";
      });
    },

    displayBudget: function(obj){
      var type;
      obj.budget >=0 ? type = 'inc' : type = 'exp'; // pour avoir le TYPE UNIQUEMENT pour avoir le signe devant le budget final en utilisant formatNumber 
      
      document.querySelector(DOMstrigs.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrigs.incLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrigs.expLabel).textContent = formatNumber(obj.totalExp, 'exp');
      
      if(obj.pourcentage >= 0){
        document.querySelector(DOMstrigs.pourcentageLabel).textContent = obj.pourcentage + '%';
      } else {
        document.querySelector(DOMstrigs.pourcentageLabel).textContent = '--%';
      }
    },

    displayPourcentages: function (pourcentages) {

      var fields = document.querySelectorAll(DOMstrigs.expPourcentageLabel); // cree un vecteur 

      // on cree notre forEach methode pour changer les pourcentage de chaque DIV dans HTML

      
      nodeListForEach(fields, function(current, index){
        if(pourcentages[index] >= 0){
          current.textContent = pourcentages[index] + '%';
        } else {
          current.textContent = '--%';
        }
        
      })
    },

    displayMonth: function(){ // comment avoir les dates 
      var now, year, month, months, day;

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      months = ['Janvier','Fevrier','Mars','Avril','May','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
      day = now.getDay() + 1;

      document.querySelector(DOMstrigs.dateLabel).textContent = day + ' ' + months[month] + ' ' + year + ' ';

    },
    
    changedType: function(type){
      var fields = document.querySelectorAll(DOMstrigs.inputValue + ', ' + DOMstrigs.inputDescription + ',' + DOMstrigs.inputType);
      
      nodeListForEach(fields, function(current){
        current.classList.toggle('red-focus');//class list c'est pour cibler les classe deja presente sur le css et les manipuler sur le HTML avec add pour ajouter remove pour enlever toggle pour ajouter si y a pas et enlever si ya 
      });
      document.querySelector(DOMstrigs.inputBtn).classList.toggle('red');
    }
  };
})();


// Global APP controler 
var appControler = (function(budgetCtrl, UICtrl){

  var setUpEventListeners = function(){
    document.querySelector(DOMstrigs.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event){
      if(event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });
    
    document.querySelector(DOMstrigs.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOMstrigs.inputType).addEventListener('change', UICtrl.changedType); //changer les bordure des inputs 
  };
  var updateBudget = function(){
    
    // 1.Calculate Budget
    
    budgetCtrl.calculateBudget();

    // 2. return Budget

    var budget = budgetCtrl.getBudget();

    // 3. Display the budget

    UICtrl.displayBudget(budget);
  };

  var updatePourcentage = function() {

    //1.calculate pourcentage

    budgetCtrl.calculatePourcentages();

    //2.read them from budget controller

    var pourcentages = budgetCtrl.getPourcentage();

    //3.update UI with the new pourcentages 

    UICtrl.displayPourcentages(pourcentages);
  }

  var ctrlAddItem = function(){
    var input, newItem;
    // 1. get input data

    input = UICtrl.getInPut();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
      // 2.add item to budget controller

      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3.add new item to UI 

      UICtrl.addListItem(newItem, input.type);

      // 4.clear the fields

      UICtrl.clearFields();

      // 5.Calculate and update budget and pourcentages
      updateBudget();
      updatePourcentage();
    }
  };

// EFFACER LES LIGNES 
  
  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID){
      // pour recuperer l'ID 
      splitID = itemID.split('-'); // resultat sera ['inc ou exp', 'ID']
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1.Delete item from data structur 

      budgetCtrl.deleteItem(type, ID);
      
      //2.Delete item from UI

      UICtrl.deleteListItem(itemID);

      //3.Update and show the new budget and pourcentages

      updateBudget();
      updatePourcentage();

    }
  }

  return{
    init: function(){
      UICtrl.displayMonth();
      console.log('start');
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        pourcentage: -1
      });
      setUpEventListeners();
    }
  };
 
})(budgetControler, UIControler);



appControler.init();