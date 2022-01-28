var mydata = require('./ex.json');
var input = require('./input.json');
var description=require('./description.json');

/********************************************************************************/

function update_data(data,filters){
	const n_arbre=lenght(data);
	
    for (var i=0;i<n_arbre ;i++){

    
			for (const prop in filters){
				if (prop=='Indice de potentiel d\'adaptation'){
				
									if(parseFloat(data[i][prop])>=3){
										
										data[i][prop]=1;
									}else if(2.5=<parseFloat(data[i][prop])<3){
										data[i][prop]=2;
				
									}else if(2=<parseFloat(data[i][prop])<2.5){
										data[i][prop]=3;
				
									}else if (1=<parseFloat(data[i][prop])<2){
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
						    case 'Neutre'
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
    const nbr_prop=lenght(description);
    for (var i=0;i<nbr_prop;i++){
    	switch (description[i]['Type de question']){
                case 'Select':
                  	const nbr_choice=lenght(description[i]['Réponses']);
			
				     default_inputs.push({
				     	key:description[i].name;
				     	value:0;
				     });
				     weight.push({
				     	key:description[i].name;
				     	value:get_weight(description[i].importance);

				     })

				     break;
				case '':
				     const nbr_choice=lenght(description[i]['Réponses']);
					 if (description[i].name=='Indice de confiance'){
					 	value_def=5;
					 }else{
					 	value_def=1;
					 };
				     default_inputs.push({
				     	key:description[i].name;
				     	value: value_def;
				     });
				     default_var.push(description[i].name);
				     weight.push({
				     	key:description[i].name;
				     	value:get_weight(description[i].importance);

				     })
				     break;
				default:
				     for (const choix in description[i]['Réponses']){
 
				       let name=get_name(choix)[0];
				       default_inputs.push({
					     	key:name;
					     	value:false;
					
					     });
				       weight.push({
				     	key:name;
				     	value:get_weight(description[i].importance);

				     });
		            };
		            break;};



    return [default_inputs, weight,default_var];
	};
/************************/

// modifier les inputs de l'utilisateur  pour les adapter à notre code



function update_prop(prop,input,default_inputs){
	if (input[prop].length==1){
		default_inputs[prop]=parseInt(input[prop]);
	};
	switch (input[prop]){
		case 'true':
		    default_inputs[prop]=true;
		    break;
		case 'false':
		    default_inputs[prop]=false;
		    break;
     };
     return default_inputs;
    
};

function delete_non_input(input){
	const l=lenght(input);
	for (var i=0;i<l;i++){
		if (Object.values(input[i])==''){
			    input.splice(i,1); 
		};
    };
    return  input;
}
function update_input(input,default_inputs,filters){
    
     for (const prop in filters){
     	     let output=update_prop(prop,input,default_inputs);

     	 };
	 return output;

           };

/************************/

function compute_score(inputs_updated,prop,data_updated,i,weight){
    if ((prop=='Tolérance pour le pH du sol') && (data_updated[i][prop]==1)){
    	data_updated[i][prop]=inputs_updated[prop]
    }

    if(data_updated[i][prop].isInteger()){

             switch (inputs_updated[prop]-data_updated[i][prop]){

					case number_choice_prop-1:

					   score=0;
					   break;
					default:
					   score=weight[pop]*Math.pow(1/2,inputs_updated[prop]-data_updated[i][prop])};
					break;}

     

    }else{

    	if(inputs_updated[prop]==data_updated[i][prop]){
    		score=weight[prop]
    	}else{
    		score=0
    	}
    }
	return score;
}

/************************/
let input=delete_non_input(input);
let [default_inputs, weight,default_var]=build_default_input_and_weights(description);
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
		if !(bloqued){
				if (weight[fil] == 'bloquant'){
		
					if(inputs_updated[fil]!=data_updated[i][fil]){
						bloqued=true;}
				}else{
					score+=compute_score(inputs_updated,prop,data_updated,i,weight);
				}
			}


	};
	if !(bloqued){
	   arbre_non_bloque.push(i);
       scores.push(score/sum_weights);
       	}

}


console.log(scores)
