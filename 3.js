var mydata = require('./ex.json');
var input1 = require('./input.json');
var description=require('./description.json');
console.log(description[0]['reponses'][0])
const n_arbre=mydata.length;
/********************************************************************************/

function update_data(data,filters){
	const n_arbre=data.lenght;
	
    for (var i=0;i<n_arbre ;i++){

    
			for (const prop in filters){
				if (prop=='Indice de potentiel d\'adaptation'){
				
									if(parseFloat(data[i][prop])>=3){
										
										data[i][prop]=1;
									}else if((parseFloat(data[i][prop])>=2.5)&&(parseFloat(data[i][prop])<3)){
										data[i][prop]=2;
				
									}else if((parseFloat(data[i][prop])>=2)&&(parseFloat(data[i][prop])<2.5)){
										data[i][prop]=3;
				
									}else if ((parseFloat(data[i][prop])>=1)&&(parseFloat(data[i][prop])<2)){
										data[i][prop]=4;
									}else if (parseFloat(data[i][prop])<1) {
										data[i][prop]=5;
									} 
				}

		         switch (data[i][prop]){

							case 'X':
							data[i][prop]=true;
						    break;
							case 'Fort':
							case 'Positif':
						     data[i][prop]=1;
						    break;
						    case '':
						     data[i]['prop']=false;
						     break;
						    case' Moyen':
						    case 'Modéré':
						    case 'Neutre':
						     data[i][prop]=2;
						     break;
						    case 'limité':
						    case 'Faible à négligeable':
						    case 'Négatif':
						     data[i][prop]=3;
						     break;
						     // c'est une entier 
						     default:
						     data[i][prop]=parseInt(data[i][prop]);
						     break;}
				}
		}
	return data;

};



//////////////////////////////////////////////////////////

function get_name(name){
	var re= /\w+/gm;
	var list = name.match(re);
	return list;

};

/************************/
function get_weight(mot){
	switch (mot){
		case 'Important':
		    return 1;
		    break;
		case 'Peu Important':
		     return 0.5;
		     break;
		default:
		     return 'bloquant'
	}
}
function build_default_input_and_weights(description){
    let default_inputs=[];
    let weight=[];
    let default_var=[];
	let n_choice=[];
	
    const nbr_prop=description.length;
	console.log(description[0]['type_question']);
    for (var i=0;i<nbr_prop;i++){
		
    	switch (description[i]['type_question']){
			case 'Select':
				
				n_choice.push({
					key:description[i].nom,
					value:description[i]['reponses'].length,
				});
				default_inputs.push({
					key:description[i].nom,
					value:0,
				});
				weight.push({
					key:description[i].nom,
					value:get_weight(description[i].importance),

				})

				break;
			case '':
				n_choice.push({
					key:description[i].nom,
					value:description[i]['reponses'].length,
				});
				if (description[i].nom=='Indice de confiance'){
					value_def=5;
				}else{
					value_def=1;
				};
				default_inputs.push({
					key:description[i].nom,
					value: value_def,
				});
				default_var.push(description[i].nom);
				weight.push({
					key:description[i].nom,
					value:get_weight(description[i].importance),

				})
				 break;
		default:
			const nb_choix=description[i]['reponses'].length;
            for (var j=0;j<nb_choix;j++){

                       let nom=description[i]['reponses'][j].valeur;
						default_inputs.push({
								key:nom,
								value:false,
						
							});
							n_choice.push({
								key:nom,
								value:2,
							});
						weight.push({
							key:nom,
							value:get_weight(description[i].importance),

						});
				  };
			break;}
						};


					console.log(default_inputs)
    return [default_inputs, weight,default_var,n_choice];
	};
/************************/

// modifier les inputs de l'utilisateur  pour les adapter à notre code



function update_prop(prop,input,default_inputs){
	if (input[prop].length==1){
		default_inputs[prop]=parseInt(input[prop]);
	};
	
     return default_inputs;
    
};

function delete_non_input(input ){
	const props=Object.keys(input);
	for (const prop in props){
		if ((input[prop]=='')||(input[prop]==false)){
			    delete input[prop]; 
		};
    };
    return  input;
};
function update_input(input,default_inputs,filters){
    
     for (const prop in filters){
     	     let output=update_prop(prop,input,default_inputs);

     	 };
	 return output;

           };

/************************/

function compute_score(inputs_updated,prop,data_updated,i,weight,n_choice){
    if ((prop=='Tolérance pour le pH du sol') && (data_updated[i][prop]==1)){
    	data_updated[i][prop]=inputs_updated[prop]
    }
	console.log("1")
    console.log(data_updated);
    if(Number.isInteger(data_updated[i][prop])){
		     const number_choice_prop=n_choice[prop];

             if(Math.abs(inputs_updated[prop]-data_updated[i][prop])==number_choice_prop-1){
				score=0;

						}
			else{
				score=weight[pop]*Math.pow(1/2,Math.abs(inputs_updated[prop]-data_updated[i][prop]))};
						
					}
     
    } 
	
	if(!(Number.isInteger(data_updated[i][prop]))){

    	if(inputs_updated[prop]==data_updated[i][prop]){
    		score=weight[prop];
    	}else{
    		score=0;
    	}
    }
	return score;
};

/************************/
console.log("1")
let [default_inputs, weight,default_var,n_choice]=build_default_input_and_weights(description);
let input=delete_non_input(input1);
let filters_input=Object.keys(input);
let filters=Object.keys(default_inputs);
var data_updated=update_data(mydata,filters);
//on ajoute les variables dont on entre input par défaut 
filters_input=filters_input.concat(default_var);
let inputs_updated=update_input(input,default_inputs,filters_input);

let scores=[];
let arbre_non_bloque=[];
const weights=Object.values(weight); 
let reducer=(accumulator,curr)=>accumulator+curr;
const sum_weights=weights.reduce(reducer);

for (let i=0;i<n_arbre;i++){
    let score =0;
    let bloqued=false;
	for (const fil in filters_input){
		if (!(bloqued)){
				if (weight[fil] == 'bloquant'){
		
					if(inputs_updated[fil]!=data_updated[i][fil]){
						bloqued=true;}
				}else{
					score+=compute_score(inputs_updated,prop,data_updated,i,weight,n_choice);
				}
			}


	};
	if (!(bloqued)){
	   arbre_non_bloque.push(i);
       scores.push(score/sum_weights);
       	}

}


console.log(scores)
