import fs from "fs"
import express from "express"
import bodyParser  from "body-parser";
//funcion para "limpiar" los datos recogidos del archivo



let procesar_input = (text)=>{
    let text_og = text;
    let especiales = new Set();
    especiales.add("á");
    especiales.add("é");
    especiales.add("í");
    especiales.add("ó");
    especiales.add("ú");
    especiales.add("ñ");
    for (let index = 0; index < text_og.length; index++) {
    
        if(text_og[index].charCodeAt(0)<97 ||  text_og[index].charCodeAt(0)>122 && !especiales.has(text_og[index])){
            text = text.replaceAll(text_og[index]," ");
            
        }
        
    }
    return text.split(" ");
}

//funcion generica para obtener los datos de los archivos entrada.in y prohibidas.in
let get_input = (url,from)=>{
    let buffer = fs.readFileSync(url,"utf-8");
    if (from ==0) {
        return procesar_input(buffer.toString().toLowerCase());
    }else{
        return buffer.toString().toLowerCase();
    }
    
}

//funcion para guardar las palabras prohibidas en un set
let guardado_prohibidas = (arr)=>{
    let prohibidas = new Set();
    arr.forEach(element => {
        if (element != "") {
            prohibidas.add(element);
        }
    });
    return prohibidas
}

//funcion para contar la cantida de veces que aparece una palabra (no prohibida)
let guardado_conteo = (arr,prohibidas)=>{
    let mapita = new Map()
    arr.forEach(element => {
        if (!prohibidas.has(element) && element!="") {
            if (mapita.has(element)) {
                let a = mapita.get(element)
                a+=1
                mapita.set(element,a);
            }else{
                mapita.set(element,1)
            }
        }
    });
    return mapita
}


//algoritmo shell sort para ordenar alfabeticamente
let shell_sort = (lista)=>{
    let div = Number((lista.length/2).toFixed());
    let aux;
    let j;
    while (div>0) {
        for (let i = div; i < lista.length; i++) {
            aux = lista[i];
            j=i;
            while (j>=div && lista[j-div]>aux) {
                lista[j] = lista[j-div];
                j-=div;
            }
            lista[j] = aux;
        }
        if (div/2 <1) {
            div = 0;
        }else{
            div = Number((div/2).toFixed());
        }
    }
    return lista
}

//se guardan las palabras ordenadas en un array y luego se verifica si hay alguna palabra que comience con enhe
let guardado_sort = (mapita)=>{
    let lista = []
    for(const [key] of mapita){
        lista.push(key);
    }
    
    return check_especiales(shell_sort(lista));
}

//funcion para revisar si existen palabras con enhe, de ser asi, se sacan en una sublista, se ordenana y luego se 
//reintroducen a la lista original.

let check_especiales = (lista)=>{
    let lista_og = lista.slice(0);
    let last = lista_og[lista_og.length-1];
    if (last[0].charCodeAt() === 241) {
        let i = 1;
        let especiales = [];
        while (last[0].charCodeAt() === 241) {
            especiales.push(last);
            i+=1;
            last = lista_og[lista_og.length-i];
            lista.pop();
        }
        let esp_sorted = shell_sort(especiales);
        last = lista[lista.length-1];
        i=1
        if (last[0].charCodeAt() <= 110) {
            return lista.concat(especiales);
        }else{
            while(!last[0].charCodeAt() <= 110){
                i+=1;
                last = lista[lista.length-i];
                if(last[0].charCodeAt()<=110){
                  
                    let porcion1 = lista.slice(0,lista.length-i+1);
                    let porcion2 = lista.slice(lista.length-i+1,lista.length);
                    return  porcion1.concat(esp_sorted).concat(porcion2);
                }
            }
        }
    }
}

let imprimir_resultado = (diccionario, lista)=>{
    let final = [];
    let i = 0;
    lista.forEach(palabra =>{
        final[i] = palabra + ": "+diccionario.get(palabra)
        console.log(palabra + ": "+diccionario.get(palabra));
        i+=1;
    });
    return final;
}
/*let input_entrada = get_input("entrada.in");
let input_prohibida = get_input("prohibidas.in");

let p_prohibidas = guardado_prohibidas(input_prohibida);
let diccionario = guardado_conteo(input_entrada,p_prohibidas);
let ordenada = guardado_sort(diccionario);

imprimir_resultado(diccionario,ordenada);*/

const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}))

//app.use(express.urlencoded({extended:true}))

app.route("/home").get((req,res)=>{
    console.log("corriendo en http://localhost:3000/home")
    let input_entrada = get_input("entrada.in",0);
    let input_prohibida = get_input("prohibidas.in",0);
    let p_prohibidas = guardado_prohibidas(input_prohibida);
    let diccionario = guardado_conteo(input_entrada,p_prohibidas);
    let ordenada = guardado_sort(diccionario);
    let final = imprimir_resultado(diccionario,ordenada);
    res.status(200).render("index",{datos_entrada:String(get_input("entrada.in",1)),datos_ban:get_input("prohibidas.in",1),data_final:final});

}).post((req,res)=>{
    res.status(200)
    console.log(req.body.input1);
    let a = req.body.input1;
    console.log(a)
    
});


app.route("/home/save").get((req,res)=>{
    res.render("index");
    
    
}).post((req,res)=>{
    fs.writeFileSync("entrada.in",String(req.body.input_texto));
    console.log("hecho!!");
    res.status(200).redirect("/home");
    
})

app.route("/home/save_banned").get((req,res)=>{
    res.render("index");
    
}).post((req,res)=>{
    fs.writeFileSync("prohibidas.in",String(req.body.input_banned));
    res.status(200).redirect("/home");

});


app.listen(3000,(req,res)=>{
    console.log("corriendo en el puerto :v");
})