var axios = require('axios')
const { Country, Actividad }  = require('../db.js');

const API_URL_PEOPLE = 'https://restcountries.com/v3/all';
const getAll =  async function () {
  //   return res.send("funciona si");
    // pedido a la api
    const respuesta = await axios(API_URL_PEOPLE);
 respuesta.data.map(c=>(
      Country.findOrCreate({
        where: { nombre: c.name.common },
        defaults:{
          id: c.cca3,
          imagBandera: c.flags[0],
          continente: c.continents[0],
          capital:c.capital?.[0],
          subRegion: c.subregion,
          area: c.area,
          poblacion: c.population
      }})
    ))
}
const getAllDB =  async function (req, res, next) {
  //   return res.send("funciona si");
    // pedido a la api
    console.log(req.query)
    getAll()
    try {
       if (Object.keys(req.query).length) {
      //   // si hay query hay que filtrar
      //   // where === donde
         Country.findAll({
          include: {
            model: Actividad,
            atributes: [ ["nombre", "dificultad", "duracion","temporada"]],
            through:{
              atributes:[]
              }
          }
        }).then((respuesta) =>
         {let country = respuesta.filter(elemento=>elemento[Object.keys(req.query)[0]].toLowerCase()===Object.values(req.query)[0].toLowerCase())
          res.json(country);
        });
       } else {
        // si no hay query debo enviar todos
        // findAll() === SELECT * FROM Character;
        Country.findAll().then(country=>{
          res.json(country)
        });
      }
      } catch (error) {
    return res.send(error);
  }
}
const getId = async function (req, res, next){
  const id = req.params.id
  try {
    let Ciudades = await Country.findAll(
       { include: {
            model: Actividad,
            atributes: [ ["nombre", "dificultad", "duracion","temporada"]],
            through:{ atributes:[] }
        }}
    );
    const Ciudad = Ciudades.filter(c => id == c.id)
    if (!Ciudad.length) {
        return res.status(404).json({message: `error 404, country not found with id ${id}`});
    }
    return res.send(Ciudad);
    } catch (error) {
        next(error)
    }
}
const getActividad =  async function (req, res, next) {
  //   return res.send("funciona si");
    try {
        Actividad.findAll({
          include: {
              model: Country,
              atributes: [  "nombre", "capital","continente","subRegion", "id","poblacion","area"],
              through:{
              atributes:[]
              }
          }
     }).then(actividad=>{
          res.json(actividad)
        });
      //}
      } catch (error) {
    return res.send(error);
  }
}
const postActividad =  async function (req, res, next) {
  const {  nombre, dificultad, duracion,temporada } = req.body.Actividad;
  const country=req.body.Country.name;
  if (!nombre || !dificultad || !duracion|| !temporada)
    return res.status(404).send("Falta enviar datos obligatorios");
    try {
      const actividad = await Actividad.create({ ...req.body.Actividad });
      const Country_Actividad = await Country.findAll({ 
        where:{
          nombre: country
        }
      })
    await actividad.addCountry(Country_Actividad);
    return res.status(201).json(actividad);
      //}
      } catch (error) {
          return res.status(404).json({ msg: "Error en alguno de los datos provistos", err: error });
  }
}
const deleteActividad = async function (req, res, next) {
  try {
    let ID = req.params.id
    Actividad.destroy({
        where: {
            id: ID
        }
    })
    res.send("actividad eliminada")
  } catch (error) {
    res.status(404).json(error)
  }
}

module.exports ={
  getAll,
  getAllDB,
  getId,
  getActividad,
  postActividad,
  deleteActividad
}