var students = {};
var table = document.getElementsByTagName("table")[0];

function createHtmlElement(options){
	let part = document.createElement(options.type);
	if(options.classes) part.classList.add(...options.classes);
	for(attribute in options.attributes) part.setAttribute(attribute, options.attributes[attribute]);
	if(options.html) part.innerHTML = options.html;
	if(options.event) part.addEventListener(options.event.type, e=>{options.event.callback(e)});
	return part;
}

//create bootstrap modal
function createDialog(options){
	//modal container
	let modal = createHtmlElement({type:"div",
	 	classes:["modal", "fade"],
		attributes:{"tabindex" : "-1", "role" : "dialog", "id":"modal"}});

	//modal dialog
	let modalDialog = createHtmlElement({type:"div",
	 	classes:["modal-dialog", "modal-dialog-centered", "modal-lg"],
		attributes:{"role":"document"}});

	//modal content container
	let modalContent = createHtmlElement({type:"div", classes:["modal-content"]});

	//modal header
	let modalHeader = createHtmlElement({type:"div", classes:["modal-header"]});
	modalHeader.append(createHtmlElement({type:"h5", classes:["modal-title"], html:options.title}))
	let closeButton = createHtmlElement({type:"button", classes:["close"], attributes:{"type":"button", "data-dismiss":"modal", "aria-label":"Close"}});
	closeButton.append(createHtmlElement({type:"span",attributes:{"aria-hidden":"true"},html:"×"}));
	modalHeader.append(closeButton);

	//modal body
	let modalBody = createHtmlElement({type:"div", classes:["modal-body"]});
	modalBody.append(options.body);

	//modal footer
	let modalFooter = createHtmlElement({type:"div", classes:["modal-footer"]});
	modalFooter.append(createHtmlElement({type:"button", classes:["btn", "btn-secondary"],attributes:{"data-dismiss":"modal"} , event:{type:"click",callback:options.secondaryCallback}, html:options.sbtext}),
	createHtmlElement({type:"button", classes:["btn", "btn-primary"],attributes:{"data-dismiss":"modal"}, event:{type:"click",callback:options.primaryCallback}, html:options.pbtext}));

	modalContent.append(modalHeader, modalBody, modalFooter);
	modalDialog.append(modalContent);
	modal.append(modalDialog);
	document.body.append(modal);
	
	//had to use jquery here
	//show the modal
	$("#modal").modal();
	//remove the modal when its gets closed 
	$('#modal').on('hidden.bs.modal', function () {
		modal.remove();
	})
}

function showDialog(dialogOptions){
	createDialog({ 
		title:"Modal",
		body:"Modal Body",
		pbtext : "Primary Button",
		sbtext: "Secondary Button",
		primaryCallback: ()=>{},
		secondaryCallback: ()=>{},
		...dialogOptions,		
	});
}

function wrapToTable(wrapObj){
	let td = document.createElement("td");
	if(Array.isArray(wrapObj)) td.append(...wrapObj);
	else td.append(wrapObj);
	return td;
}

function createTableInput(inputValue){
	return wrapToTable(createHtmlElement({type:"input", attributes:{"value":inputValue}}));
}

function createActionButtons(parent, student){
	let buttons = Array(3).fill().map(() => document.createElement("i"));
	buttons[0].classList.add("accept-button");
	buttons[1].classList.add("deny-button");
	buttons[2].classList.add("delete-button");
	buttons[2].addEventListener("click", ()=>{
		showDialog({
			title:"Confirmation",
			body:"Are you sure you want to delete " + student.name + " ?",
			primaryCallback: () => {
				delete students[parent.children[0].children[0].value];
				parent.remove();
			},
			pbtext : "Yes",
			sbtext: "No",
		});
	});
	return wrapToTable(buttons);
}

function addStudentToTable(student){
	let tr = createHtmlElement({type:"tr", classes:["student-col"]});

	for(feature in student) tr.append(createTableInput(student[feature]));

	tr.append(createActionButtons(tr, student));

	table.children[1].append(tr);
}

document.getElementsByClassName("add-button")[0].addEventListener("click", ()=>{
	let container = createHtmlElement({type:"div", classes:["container-fluid"]});
	container.append(createHtmlElement({type:"div", classes:["row"]}));
	let neededData = ["ID", "Name", "GDPA"];
	let dataInputs = {};
	for(value of neededData){ 
		let col = createHtmlElement({type:"div", classes:["col-4"]});
		dataInputs[value] = createHtmlElement({type:"input", classes:["temp"]});
		dataInputs[value].addEventListener("input", e => {e.target.classList.toggle("has-value", e.target.value != "")})
		col.append(dataInputs[value], createHtmlElement({type:"label", html:value}));
		container.children[0].append(col);
	}

	showDialog({
		title:"Add new Student",
		body:container,
		pbtext : "Add",
		sbtext: "Exit",
		primaryCallback: () => {
			students[dataInputs["ID"].value] = {name:dataInputs["Name"].value, gdpa:dataInputs["GDPA"].value};
			addStudentToTable({id:dataInputs["ID"].value, ...students[dataInputs["ID"].value]});
		},
	});
});

// This week task:
// Show list of students 
// Update student
// Delete student

// 10 marks
// 1) based on the follwoing:
// a) easy to use  and prettyu look 3
// b) resposnive design 2

// c) clean code 2
// d) show list for the user 1
// e) update 1
// f) delete 1

// Deeadline: 20/2, on github.
