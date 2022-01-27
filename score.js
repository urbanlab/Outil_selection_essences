var mydata = require('./ex.json');
var input = require('./input.json');
var description=require('./desc.json');
let default_inputs=[];
const nbr_prop=length(description); 


function multiply(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}
const constructIdentity = (num = 1) => {
   const res = [];
   for(let i = 0; i < num; i++){
      if(!res[i]){
         res[i] = [];
      };
      for(let j = 0; j < num; j++){
         if(i === j){
            res[i][j] = 1;
         }else{
            res[i][j] = 0;
         };
      };
   };
   return res;
};

const constructweightmatrix= (num = 1) => {
   const res = [];
   for(let i = 0; i < num; i++){
      if(!res[i]){
         res[i] = [];
      };
      for(let j = 0; j < num; j++){
         if(Math.abs(i-j)<num-1){
            res[i][j] = Math.pow(1/2,Math.abs(i-j));
         }else{
            res[i][j] = 0;
         };
      };
   };
   return res;
};

function get_name(name){
	var re= /\w+/gm;
	var list = name.match(re);
	return list;

};


function build_default_input(description){
    let default_inputs=[];
    const nbr_prop=lenght(description);
    for (var i=0;i<nbr_prop;i++){
	if (description[i]['Type de question']=='Select'){

			 const nbr_choice=lenght(description[i]['Réponses']);
			
		     default_inputs.push({
		     	key:description[i].name;
		     	value:Array(nbr_choice).fill(0);
		     })
			
	    
	}
	else if(description[i]['Type de question']==''){
             const nbr_choice=lenght(description[i]['Réponses']);
			 let valuedef=Array(nbr_choice-1).fill(0);
		     default_inputs.push({
		     	key:description[i].name;
		     	value: valuedef.unshift(1);
		     })

	}
	else {
	 	for (const choix in description[i]['Réponses']){
 
		       name=get_name(choix)[0]
		       default_inputs.push({
			     	key:name;
			     	value:[0,1];
			
			     })
            }


	 }}
    return default_inputs;
	};

function get_values(description){
    let default_inputs=[];
    const nbr_prop=lenght(description);
    for (var i=0;i<nbr_prop;i++){
            name=get_name(choix)[0]
		     default_inputs.push({
			     	key:name;
			     	value:[0,1];
			
			     })

    }
}

function build_default_weights(description,nbr_choice){
	let default_weights=[];
	if (description[i]['Catégorique']=='True'){
		  
		  const nbr_choice=lenght(description[i]['Réponses']);
			
		     default_inputs.push({
		     	key:description[i].name;
		     	value:constructIdentity(nbr_choice);
		     })
	}else{
         
          const nbr_choice=lenght(description[i]['Réponses']);
			
		     default_inputs.push({
		     	key:description[i].name;
		     	value:constructweightmatrix(nbr_choice);
		     })

	}
 
}



const weights=Object.values(default_weights);
const reducer=(accumulator,curr)=>accumulator+curr;
const sum_weights=weights.reduce(reducer);
const filters=Object.keys(default_inputs);

function update_prop(prop,input,default_inputs){
	if (input[prop].length==1){
		default_inputs[prop][parseInt(inputs[prop])-1]=1;
	}else if (Boolean input[prop]){
		default_inputs[prop]=[1,0];
    };
    
};
function update_input(input,default_inputs,filters){

	for (const filter in filters){
         update_prop(prop,input,default_inputs)
	};
	return default_inputs;

};

function 
function update_data(data,default_inputs,filters){
	for (const filter in filters){
         update_prop(prop,input,default_inputs)
	};
	return default_inputs;

};

function update_prop_output(prop,input,default_inputs){
	if (input[prop].length==1){
		default_inputs[prop][parseInt(inputs[prop])]=1;
	}else if (Boolean input[prop]){
		default_inputs[prop]=[1,0];
    };
filters_input =Object.keys(inputs);
n_arbre=length(mydata);
let scores=[];
let arbre_non_bloque=[];
for (let i=0;i<n_arbre;i++){
    let score =0;
    let bloqued=false;
	for (const fil in filters_input){
		if !(bloqued){
				if (bloquant[fil]){
		
					if(inputs_updated[prop]==data_updated[i][prop]){
						bloqued=true;
					}
				}else{
					score+=
				}
			}


	};
	if !(bloqued){
	   arbre_non_bloque.push(i);
       scores.push(score/sum_weights);
       	}

}
