var students = {};
var table = document.getElementsByTagName("table")[0];

function isStringNumber(str){
	return /^\d+$/.test(str);
}

function checkStudentInputs(idInput, nameInput, gdpaInput){
	return (isStringNumber(idInput.value) &&
	isStringNumber(gdpaInput.value) &&
	nameInput.value != "" &&
	gdpaInput.value >= 0 &&
	gdpaInput.value <= 4);
}

function createHtmlElement(options){
	let part = document.createElement(options.type);
	if(options.classes) part.classList.add(...options.classes);
	for(attribute in options.attributes) part.setAttribute(attribute, options.attributes[attribute]);
	if(options.html) part.innerHTML = options.html;
	if(options.event) part.addEventListener(options.event.type, e=>{options.event.callback(e)});
	return part;
}

function isStudentListEmpty(){
	return Object.keys(students).length == 0;
}

function checkNoOfStudents(){
	table.parentElement.parentElement.classList.toggle("hidden", isStudentListEmpty());
	document.getElementById("empty").classList.toggle("hidden", !isStudentListEmpty());
}

function saveFile(name, content){
	var myBlob = new Blob([content], {type: 'text/plain'});
	var anchor = createHtmlElement({type:"a", attributes:{"href":window.URL.createObjectURL(myBlob), "download":name }});
	anchor.click();
}

function parseStudentJson(json){
	try{
		let parsedStudents = JSON.parse(json);
		students = parsedStudents;
		showStudentList();
	}catch{
		showDialog({
			title:"Couldn't perform the operation",
			body:"Couldn't read file",
			pbtext:"Ok",
			showSecondaryButton:false
		});
	}
}

function readFile(file){
	var reader = new FileReader();
  	reader.onload = e => {
  	  	var contents = e.target.result;
  	  	parseStudentJson(contents);		
  	};
  	reader.readAsText(file);
}

function clearTable(){
	for(student in students) addStudentToTable({id:student,...students[student]});
	checkNoOfStudents();
}

function showStudentList(){
	while(table.children[1].lastElementChild) table.children[1].lastElementChild.remove();
	clearTable();
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
	if(options.showSecondaryButton) modalFooter.append(createHtmlElement({type:"button", classes:["btn", "btn-secondary"],attributes:{"id":"modal-secondary","data-dismiss":"modal", ...(options.disableSecondary ? {"disabled":true} : {})} , event:{type:"click",callback:options.secondaryCallback}, html:options.sbtext}))
	modalFooter.append(createHtmlElement({type:"button", classes:["btn", "btn-primary"],attributes:{"id":"modal-primary","data-dismiss":"modal",...(options.disablePrimary ? {"disabled":true} : {})}, event:{type:"click",callback:options.primaryCallback}, html:options.pbtext}));

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
	//check number of student when modal ends
	$('#modal').on('hide.bs.modal', function () {
		checkNoOfStudents();
	})
}

function showDialog(dialogOptions){
	createDialog({ 
		title:"Modal",
		body:"Modal Body",
		pbtext : "Primary Button",
		sbtext: "Secondary Button",
		showSecondaryButton: true,
		disablePrimary: false,
		disableSecondary:false,
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
	return wrapToTable(createHtmlElement({type:"p", html:inputValue}));
}

function createActionButtons(parent, student){
	let editButton = createHtmlElement({
		type:"i", 
		classes:["edit-button"],
		event:{type:"click", callback:()=>{
			let container = createHtmlElement({type:"div", classes:["container-fluid"]});
			container.append(createHtmlElement({type:"div", classes:["row"]}));
			let neededData = {
				"ID":parent.children[0].children[0].innerText,
				"Name":parent.children[1].children[0].innerText,
				"GDPA":parent.children[2].children[0].innerText
			};			

			let dataInputs = {};
			for(value in neededData){ 
				let col = createHtmlElement({type:"div", classes:["col-12", "col-md-4" ,"m-2", "m-md-0"]});
				dataInputs[value] = createHtmlElement({
					type:"input",
					classes:["prettyInput", "has-value"],
					event:{type:"input", callback:e => {
						e.target.classList.toggle("has-value", e.target.value != "");
						if(value == "ID" || value == "GDPA") document.getElementById("modal-primary").disabled = check();
					}},
					attributes:{"value": neededData[value]}
				});
				let check = () => {return !checkStudentInputs(dataInputs["ID"], dataInputs["Name"], dataInputs["GDPA"])}
				col.append(dataInputs[value], createHtmlElement({type:"label", html:value}));
				container.children[0].append(col);
			}

			showDialog({
				title: "Edit user",
				body: container,
				primaryCallback: () => {
					if(neededData["ID"] == dataInputs["ID"].value) students[neededData["ID"]] = {name:dataInputs["Name"].value, gdpa:dataInputs["GDPA"].value};
					else{
						delete students[neededData["ID"]];
						students[dataInputs["ID"].value] = {name:dataInputs["Name"].value, gdpa:dataInputs["GDPA"].value};
					}
					parent.children[0].children[0].innerText = dataInputs["ID"].value;
					parent.children[1].children[0].innerText = dataInputs["Name"].value;
					parent.children[2].children[0].innerText = dataInputs["GDPA"].value;
				},
				pbtext : "Save changes",
				sbtext: "Exit",
			});
		}}
	});
	let deleteButton = createHtmlElement({
		type:"i",
		classes:["delete-button"],
		event:{type:"click", callback:()=>{
			showDialog({
				title:"Confirmation",
				body:"Are you sure you want to delete " + student.name + " ?",
				primaryCallback: () => {
					delete students[parent.children[0].children[0].innerText];
					parent.remove();
				},
				pbtext : "Yes",
				sbtext: "No",
			});
		}}
	});
	return wrapToTable([editButton, deleteButton]);
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
		let col = createHtmlElement({type:"div", classes:["col-12", "col-md-4","m-2", "m-md-0"]});
		dataInputs[value] = createHtmlElement({
			type:"input",
			classes:["prettyInput"],
			event:{type:"input", callback:e => {
				e.target.classList.toggle("has-value", e.target.value != "");
				if(value == "ID" || value == "GDPA") document.getElementById("modal-primary").disabled = check();
			}},
		});
		let check = () => {return !checkStudentInputs(dataInputs["ID"], dataInputs["Name"], dataInputs["GDPA"])}
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
		disablePrimary: true
	});
});

document.getElementsByClassName("delete-all-button")[0].addEventListener("click", ()=>{
	showDialog({
		title:"Are you sure you want to delete all students ?",
		body:"This action cannot be undone",
		pbtext:"Yes",
		sbtext:"No",
		primaryCallback: ()=>{
			clearTable();
			students = {};
		}
	});
});

document.getElementsByClassName("save-button")[0].addEventListener("click", ()=>{
	if(!isStudentListEmpty()) saveFile("Students.json", JSON.stringify(students));
	else showDialog({
		title:"Couldn't performe the operation",
		body:"There are no students to save",
		pbtext:"Ok",
		showSecondaryButton:false
	});
});

let uploadElement = document.getElementById("upload-file");
uploadElement.addEventListener("change", e => {readFile(e.target.files[0]);});

document.getElementsByClassName("upload-button")[0].addEventListener("click", ()=>{
	uploadElement.click();
});

function toggleNavbar(){
	document.getElementsByTagName("header")[0].classList.toggle("nav-hidden");
	document.getElementById("navbarText").classList.remove("show");
}

document.getElementsByTagName("header")[1].addEventListener("click", toggleNavbar);
document.getElementsByClassName("navbar-brand")[0].addEventListener("click", toggleNavbar);


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
