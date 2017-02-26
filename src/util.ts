// sending functions 
export function result2send(result){
let dataToSend = <any[]>result.hits.hits.map(h => {
        let fields = Object.assign({}, h._source);
        fields._id = h._id;
        fields.date = new Date(fields.date);
        return fields;
    });
return dataToSend;
}