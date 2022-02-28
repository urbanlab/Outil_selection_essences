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
		case 'Peu important':
		     return 0.5;
		     break;
		default:
		     return 'bloquant'
	}
}
/***************************************************** */
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }


function get_val(description,i){
    
    if (isNumeric(description[i]['reponses'][0].valeur)){
        
        return 0;
    }else{return '';}
}

function build_default_input_and_weights(description){
    let default_inputs={};
    let weight={};
    let default_var=[];
	let n_choice={};
	
    const nbr_prop=description.length;
    for (var i=0;i<nbr_prop;i++){
		
    	switch (description[i]['type_question']){
			case 'Select':
						
				n_choice[description[i].nom]=description[i]['reponses'].length;
				default_inputs[description[i].nom]=get_val(description,i);
				
				weight[description[i].nom]=get_weight(description[i].importance);

				break;
			case '':
				
				if (description[i].nom=='Indice de confiance'){
					value_def=5;
				}else{
					value_def=1;
				};
				n_choice[description[i].nom]=description[i]['reponses'].length;
				default_inputs[description[i].nom]=value_def;
				
				weight[description[i].nom]=get_weight(description[i].importance);
				default_var.push(description[i].nom);
				
				 break;
		default:
			
            const nb_choix=description[i]['reponses'].length;
            for (var j=0;j<nb_choix;j++){
					

                       let nom=description[i]['reponses'][j].valeur;
						default_inputs[nom]=false;
						n_choice[nom]=2;
						
						weight[nom]=get_weight(description[i].importance);}

			break;}
						};


							
    return [default_inputs, weight,default_var,n_choice];
	};
//////////////////////////////////////////////

//eleminer les element vides de l'input 
function delete_non_input(input){
    const props=Object.keys(input);
    for (const i in props){
        prop=props[i];
        if ((input[prop]=='')||(input[prop]==false)){
                delete input[prop]; 
        };
    };
    return  input;
};


////////////////////////////////////////////////


function update_input(input,default_inputs){
    let filters1=Object.keys(input);
     for (const i in filters1){
        prop = filters1[i];
        
        if (isNumeric(input[prop]) ){
            
                
                default_inputs[prop]=parseInt(input[prop]);
            
           }else{
			   default_inputs[prop]=input[prop];
		}
           

     	 };
          
	 return default_inputs;

           };
           

///////////////////////////////////////////////////:
//modifier les données pour les addapter au calcul et extraire les colonnes de types ensolelliment (contenant des intervalles)
function update_data(data1,filters){
    data=JSON.parse(JSON.stringify(data1));
	const n_arbre=data.length;
	var col_enso=[]
	
    for (var i=0;i<n_arbre ;i++){

             
			for (const j in filters){
                prop=filters[j];
				
                
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
							case ' ':
						     data[i][prop]=false;
						     break;
						    case'Moyen':
							case'Moyen ':
						    case 'Modéré':
						    case 'Neutre':
						     data[i][prop]=2;
						     break;
						    case 'Limité':
						    case 'Faible à négligeable':
						    case 'Négatif':
						     data[i][prop]=3;
						     break;
						     // c'est une entier 
						     default:
								 let temp=data[i][prop]+''
								 if (isNumeric(data[i][prop]) ){
            
                
									data[i][prop]=parseInt(data[i][prop]);
								
							   }else if (temp.split('-').length==2)
							   {
								   col_enso.push(prop)

							   }
							
						     
						     break;}
				}
		}

	return [data,Array.from(new Set(col_enso))];

};


/////////////////////////////
//calcul de scores qu'on utilise pour toutes les colonnes sauf ceux contennat des intervalles
function compute_score(inputs_updated,prop,data_updated,i,weight,n_choice){
    if ((prop=='Tolérance pour le pH du sol') && (data_updated[i][prop]== 1)){
    	data_updated[i][prop]=inputs_updated[prop];
		
    }
	
	let score=0;
    if(Number.isInteger(data_updated[i][prop])){
		
		     const number_choice_prop=n_choice[prop];
			 

			score=((Math.abs(inputs_updated[prop]-data_updated[i][prop])==number_choice_prop-1) ? 0 : weight[prop]*Math.pow(1/2,Math.abs(inputs_updated[prop]-data_updated[i][prop])));

			
     
    } 
	else{
        score=((inputs_updated[prop]==data_updated[i][prop]) ? weight[prop]: 0)
    	
    }
	return score;
}


////////////////////////////////::::
//Calcul des sommes de poids
function sum(weights,filters_input){
	let out=0;
	
	for(const i in filters_input){
		p=filters_input[i];
		
		const add=((weights[p]=='bloquant')? 0:weights[p]);
		out+=add;
	}
	return out
}


////////////////////////////////////////////////////////
// Checking if the array lengths are same 
// and none of the array is empty
function convertToObj(a, b){
	if(a.length != b.length || a.length == 0 || b.length == 0){
	 return null;
	}
	let obj = {};
	  
  // Using the foreach method
	a.forEach((k, i) => {obj[k] = b[i]})
	return obj;
  }


//////////////////////////////////::
function sort_object(resultat,mydata){
	// pour ordonner une liste d'objets en utiliasant une liste de scores
	let list_sorted=Object.entries(resultat).sort((a,b) => b[1]-a[1]).map(el=>el[0]);
	let out =[]
	for (const i in list_sorted){
		let arbre=parseInt(list_sorted[i]);
		
		out.push(mydata[arbre]);


	}
	
	return out
}

/////////////////////////////////////////////////////////////////////////
function compute_score_ensoleilleiment(inputs_updated,prop,data_updated,i,weight){
 // calcul des scores pour les colonnes où il y'a des intervalles  comme ceux de l'ensoleillement
 let score=0;
 
 if (data_updated[i][prop]=='N/A'){
	 score=0
 }
else{
	//data_updated[i][prop]=data_updated[i][prop].toString()
	
	
	
	if (Number.isInteger(data_updated[i][prop])){
		score=((data_updated[i][prop]==inputs_updated[prop])? weight[prop]:0)
	}else{
		let parts=data_updated[i][prop].split('-');
        score=(((parseInt(parts[0])<=inputs_updated[prop]) && (inputs_updated[prop]<=parseInt(parts[1])) )? weight[prop]:0)
	}
}

return score;
}

/////////////////////////////////////////////////////////////////
//calcul du score final
function compute_scores(mydata,description,input1){	
			let [default_inputs, weight,default_var,n_choice]=build_default_input_and_weights(description);
			
			let input=delete_non_input(input1);
			

			let filters_input=Object.keys(input);
			filters_input=filters_input.concat(default_var);
			let filters=Object.keys(default_inputs);

			
			let inputs_updated=update_input(input,default_inputs);
			
			let [data_updated,col_enso]=update_data(mydata,filters);
			
			col_enso.push('Besoin en ensoleillement');
			col_enso=Array.from(new Set(col_enso));
			
			const n_arbre=data_updated.length;
			let scores=[];
			let arbre_non_bloque=[];
			let arbre_bloque=[];
			const sum_weights=sum(weight,filters_input);
			

			for (let i=0;i<n_arbre;i++){
				let score =0;
				
				let bloqued=false;
				for (const j in filters_input){
					
					fil=filters_input[j];
					
					if (!(bloqued)){
						
						
							
						if (!(weight[fil] == 'bloquant')){
						
							
							score+=((fil in col_enso)? compute_score_ensoleilleiment(inputs_updated,fil,data_updated,i,weight):compute_score(inputs_updated,fil,data_updated,i,weight,n_choice))
							
							
						}else{
							bloqued=((inputs_updated[fil]!=data_updated[i][fil])? true: false)
							
							
						}
						
					}


				};
				if (!(bloqued)){
					arbre_non_bloque.push(i);
					
					scores.push(score);
				}else{
					arbre_bloque.push(i);
				}

			}
            if (arbre_non_bloque.length==0 ){
				return([])
			}else{
				let resultat=convertToObj(arbre_non_bloque,scores);
				return (sort_object(resultat,mydata));
				
				
				
				;
			}
			
		};

var mydata = require('./data/arbres.json');
var input1 = require('./input.json');
var description=require('./data/filtres.json');
//console.log(compute_scores(mydata,description,input1))


module.exports = compute_scores;



