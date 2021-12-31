const MyBusiness11 = require('../utils/MyBusiness11')
const MyBusiness20 = require('../utils/Mybusiness20')
const moment = require('moment')

const getMyBusiness11Sales = async () =>{
    try {
        const response = await MyBusiness11.executeQuery(`SELECT TOP 100000 * FROM ventas WHERE migrated = 0 AND tipo_doc <> 'PE' AND USUFECHA >= '01/01/2018' AND cliente <> 'SELE' `)
        if(response.error) throw response.errorDetail
        return response.data[0]
    } catch (error) {
        console.log(error)
        return undefined
    }
    
}

const configureTables = async () => {    
    try {        
        const migrated = await MyBusiness11.executeQuery(`IF COL_LENGTH('ventas', 'migrated') IS NULL BEGIN ALTER TABLE ventas ADD migrated BIT CONSTRAINT df_migrated DEFAULT (0) WITH VALUES END`)        
        if(migrated.error) throw migrated.errorDetail

        const migratedFrom = await MyBusiness20.executeQuery(`IF COL_LENGTH('ventas', 'migratedFrom') IS NULL BEGIN ALTER TABLE ventas ADD migratedFrom INT END`)
        if(migratedFrom.error) throw migratedFrom.errorDetail

        const migratedFromDebt = await MyBusiness20.executeQuery(`IF COL_LENGTH('cobranza', 'migratedFrom') IS NULL BEGIN ALTER TABLE cobranza ADD migratedFrom INT END`)
        if(migratedFromDebt.error) throw migratedFromDebt.errorDetail

        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

const cobranzaTypes = debt =>{
    /*CLIENTE, FECHA, serieDocumento, TIPO_DOC, NO_REFEREN, FECHA_VENC, IMPORTE, MONEDA, SALDO, TIP_CAM, VENTA, COBRADOR, ESTADO, OBSERV, USUARIO, USUFECHA, USUHORA*/
    const format = 'MM/DD/YYYY'
    const fecha_venc = moment(debt.FECHA_VENC).add(1,'d').format(format)
    const fecha = moment(debt.FECHA).add(1,'d').format(format)
    const usufecha = moment(debt.USUFECHA).add(1,'d').format(format)


    return [
        {name: 'CLIENTE', type: 'varchar', value: debt.CLIENTE},
        {name: 'FECHA', type: 'varchar', value: fecha},
        {name: 'SERIEDOCUMENTO', type: 'varchar', value: debt.serieDocumento},
        {name: 'TIPO_DOC', type: 'varchar', value: debt.TIPO_DOC},
        {name: 'NO_REFEREN', type: 'varchar', value: debt.NO_REFEREN},
        {name: 'FECHA_VENC', type: 'varchar', value: fecha_venc},
        {name: 'IMPORTE', type: 'FLOAT', value: debt.IMPORTE},
        {name: 'MONEDA', type: 'varchar', value: debt.MONEDA},
        {name: 'SALDO', type: 'float', value: debt.SALDO},
        {name: 'TIP_CAM', type: 'INT', value: debt.TIP_CAM},
        {name: 'VENTA', type: 'int', value: 1},
        {name: 'COBRADOR', type: 'varchar', value: debt.COBRADOR},
        {name: 'ESTADO', type: 'varchar', value: debt.ESTADO},
        {name: 'OBSERV', type: 'varchar', value: debt.OBSERV},
        {name: 'USUARIO', type: 'varchar', value: debt.USUARIO},
        {name: 'USUFECHA', type: 'varchar', value: usufecha},
        {name: 'USUHORA', type: 'varchar', value: debt.USUHORA},
        {name: 'MIGRATEDFROM', type: 'int', value: debt.COBRANZA},
    ]
}

const cobdetTypes = (debt, debtNumber) =>{
    /*(COBRANZA, CLIENTE, FECHA, serieDocumento, TIPO_DOC, NO_REFEREN, Cargo_ab, IMPORTE, MONEDA, TIP_CAM, VENTA, COBRADOR, OBSERV, ABONO, USUARIO, USUFECHA, USUHORA, CONCEPTO)*/
    const format = 'MM/DD/YYYY'
    
    const fecha = moment(debt.FECHA).add(1,'d').format(format)

    let usufecha, usuhora 
    usuhora = debt.USUHORA
    usufecha = moment(debt.USUFECHA).format(format)
    if(!debt.USUFECHA) usufecha = moment(debt.FECHA).format(format)
    if(!debt.USUHORA) usuhora = '00:00:00'
    return [
        {name: 'COBRANZA', type: 'varchar', value: debtNumber},
        {name: 'CLIENTE', type: 'varchar', value: debt.CLIENTE},
        {name: 'FECHA', type: 'varchar', value: fecha},
        {name: 'SERIEDOCUMENTO', type: 'varchar', value: debt.serieDocumento},
        {name: 'TIPO_DOC', type: 'varchar', value: debt.TIPO_DOC},
        {name: 'NO_REFEREN', type: 'varchar', value: debt.NO_REFEREN},
        {name: 'Cargo_ab', type: 'varchar', value: debt.Cargo_ab},
        {name: 'IMPORTE', type: 'FLOAT', value: debt.IMPORTE},
        {name: 'MONEDA', type: 'varchar', value: debt.MONEDA},
        {name: 'TIP_CAM', type: 'INT', value: debt.TIP_CAM},
        {name: 'VENTA', type: 'int', value: 1},
        {name: 'COBRADOR', type: 'varchar', value: debt.COBRADOR},
        {name: 'ESTADO', type: 'varchar', value: debt.ESTADO},
        {name: 'OBSERV', type: 'varchar', value: debt.OBSERV},
        {name: 'ABONO', type: 'int', value: debt.ABONO},
        {name: 'USUARIO', type: 'varchar', value: debt.USUARIO},
        {name: 'USUFECHA', type: 'varchar', value: usufecha},
        {name: 'USUHORA', type: 'varchar', value: usuhora},
        {name: 'CONCEPTO', type: 'varchar', value: debt.CONCEPTO},
    ]
}

const salesTypes = (sale, cobranza) =>{
    /*(OCUPADO, TIPO_DOC, serieDocumento, NO_REFEREN, F_EMISION, F_VENC, CLIENTE, VEND, IMPORTE, DESCUENTO, IMPUESTO, PRECIO, COSTO, ALMACEN, ESTADO, OBSERV, TIPO_CAM, MONEDA, DESC1, DESC2, DESC3, DESC4, DESC5, DATOS, ENFAC, VENTAREF, CIERRE, cierretienda, DESGLOSE, COBRANZA, USUARIO, USUFECHA, USUHORA, AUTO, Relacion, PEDCLI, PEMB, DATEMB, AplicarDes, TipoVenta, Exportado, SUCURSAL, VentaSuc, Pago1, Pago2, Concepto1, Concepto2, Pago3, Concepto3, Comision, VentaOrigen, Diario, Caja, OrigenDev, Corte, Impreso, BANCO, NumeroCheque, Estacion, interes, redondeo, Ticket, importar. sucremota, ventaremota, comodin, iespecial, nodesglosedetalle, Transporte, Repartidor, horasalida, horaregreso, comisiontel, verificado, donativo, pagado, comisionvendedor, comodin1, comodin2, comodin3, comodin4, pago4, concepto4, pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, fechacierre, pedido, archivoFE, UUID, ComprobanteXML, tpago, FOLREL, SALDO, RELFISCAL, FactDiaria, migratedFrom)*/

    const format = 'MM/DD/YYYY HH:MM:SS'
    const f_emision = moment(sale.F_EMISION).add(1,'d').format(format)
    const f_venc = moment(sale.F_VENC).add(1,'d').format(format)
    const fechacierre = moment(sale.fechacierre).add(1,'d').format(format)
    const usufecha = moment(sale.USUFECHA).add(1,'d').format(format)

    return [
        {name: 'OCUPADO', type: 'int', value: sale.OCUPADO},
        {name: 'TIPO_DOC', type: 'varchar', value: sale.TIPO_DOC},
        {name: 'serieDocumento', type: 'varchar', value: sale.serieDocumento},
        {name: 'NO_REFEREN', type: 'varchar', value: sale.NO_REFEREN},
        {name: 'F_EMISION', type: 'varchar', value: f_emision},
        {name: 'F_VENC', type: 'varchar', value: sale.FVENC ? f_venc : null},
        {name: 'CLIENTE', type: 'varchar', value: sale.CLIENTE},
        {name: 'VEND', type: 'varchar', value: sale.VEND},
        {name: 'IMPORTE', type: 'float', value: sale.IMPORTE},
        {name: 'DESCUENTO', type: 'float', value: sale.DESCUENTO},
        {name: 'IMPUESTO', type: 'float', value: sale.IMPUESTO},
        {name: 'PRECIO', type: 'float', value: sale.PRECIO},
        {name: 'COSTO', type: 'float', value: sale.COSTO},
        {name: 'ALMACEN', type: 'int', value: sale.ALMACEN},
        {name: 'ESTADO', type: 'varchar', value: sale.ESTADO},
        {name: 'OBSERV', type: 'varchar', value: sale.OBSERV},
        {name: 'TIPO_CAM', type: 'INT', value: sale.TIPO_CAM},
        {name: 'MONEDA', type: 'varchar', value: sale.MONEDA},
        {name: 'DESC1', type: 'int', value: sale.DESC1},
        {name: 'DESC2', type: 'int', value: sale.DESC2},
        {name: 'DESC3', type: 'int', value: sale.DESC3},
        {name: 'DESC4', type: 'int', value: sale.DESC4},
        {name: 'DESC5', type: 'int', value: sale.DESC5},
        {name: 'DATOS', type: 'varchar', value: sale.DATOS},
        {name: 'ENFAC', type: 'int', value: sale.ENFAC},
        {name: 'VENTAREF', type: 'int', value: 0},
        {name: 'CIERRE', type: 'int', value: sale.CIERRE},
        {name: 'cierretienda', type: 'int', value: sale.cierretienda},
        {name: 'DESGLOSE', type: 'int', value: sale.DESGLOSE},
        {name: 'COBRANZA', type: 'int', value: cobranza},
        {name: 'USUARIO', type: 'varchar', value: sale.USUARIO},
        {name: 'USUFECHA', type: 'varchar', value: usufecha},
        {name: 'USUHORA', type: 'varchar', value: sale.USUHORA},
        {name: 'AUTO', type: 'varchar', value: sale.AUTO},
        {name: 'Relacion', type: 'varchar', value: sale.Relacion},
        {name: 'PEDCLI', type: 'varchar', value: sale.PEDCLI},
        {name: 'PEMB', type: 'varchar', value: sale.PEMB},
        {name: 'DATEMB', type: 'varchar', value: sale.DATEMB},
        {name: 'AplicarDes', type: 'varchar', value: sale.AplicarDes},
        {name: 'TipoVenta', type: 'varchar', value: sale.TipoVenta},
        {name: 'Exportado', type: 'varchar', value: sale.Exportado},
        {name: 'SUCURSAL', type: 'varchar', value: sale.SUCURSAL},
        {name: 'VentaSuc', type: 'varchar', value: sale.VentaSuc},
        {name: 'Pago1', type: 'varchar', value: sale.Pago1},
        {name: 'Pago2', type: 'varchar', value: sale.Pago2},
        {name: 'Concepto1', type: 'varchar', value: sale.Concepto1},
        {name: 'Concepto2', type: 'varchar', value: sale.Concepto2},
        {name: 'Pago3', type: 'varchar', value: sale.Pago3},
        {name: 'Concepto3', type: 'varchar', value: sale.Concepto3},
        {name: 'Comision', type: 'varchar', value: sale.Comision},
        {name: 'VentaOrigen', type: 'varchar', value: sale.VentaOrigen},
        {name: 'Diario', type: 'varchar', value: sale.Diario},
        {name: 'Caja', type: 'varchar', value: sale.Caja},
        {name: 'OrigenDev', type: 'varchar', value: sale.OrigenDev},
        {name: 'Corte', type: 'varchar', value: sale.Corte},
        {name: 'Impreso', type: 'varchar', value: sale.Impreso},
        {name: 'BANCO', type: 'varchar', value: sale.BANCO},
        {name: 'NumeroCheque', type: 'varchar', value: sale.NumeroCheque},
        {name: 'Estacion', type: 'varchar', value: sale.estacion},
        {name: 'interes', type: 'varchar', value: sale.interes},
        {name: 'redondeo', type: 'varchar', value: sale.redondeo},
        {name: 'Ticket', type: 'varchar', value: sale.Ticket},
        {name: 'importar', type: 'varchar', value: sale.importar},
        {name: 'sucremota', type: 'varchar', value: sale.sucremota},
        {name: 'ventaremota', type: 'varchar', value: sale.ventaremota},
        {name: 'comodin', type: 'varchar', value: sale.comodin},
        {name: 'iespecial', type: 'varchar', value: sale.iespecial},
        {name: 'nodesglosedetalle', type: 'varchar', value: sale.nodesglosedetalle},
        {name: 'Transporte', type: 'varchar', value: sale.transporte},
        {name: 'Repartidor', type: 'varchar', value: sale.Repartidor},
        {name: 'horasalida', type: 'varchar', value: sale.horasalida},
        {name: 'horaregreso', type: 'varchar', value: sale.horaregreso},
        {name: 'comisiontel', type: 'varchar', value: sale.comisiontel},
        {name: 'verificado', type: 'varchar', value: sale.verificado},
        {name: 'donativo', type: 'varchar', value: sale.donativo},
        {name: 'pagado', type: 'varchar', value: sale.pagado},
        {name: 'comisionvendedor', type: 'varchar', value: sale.comisionvendedor},
        {name: 'comodin1', type: 'varchar', value: sale.comodin1},
        {name: 'comodin2', type: 'varchar', value: sale.comodin2},
        {name: 'comodin3', type: 'varchar', value: sale.comodin3},
        {name: 'comodin4', type: 'varchar', value: sale.comodin4},
        {name: 'pago4', type: 'varchar', value: sale.pago4},
        {name: 'concepto4', type: 'varchar', value: sale.concepto4},
        {name: 'pregunta1', type: 'varchar', value: sale.pregunta1},
        {name: 'pregunta2', type: 'varchar', value: sale.pregunta2},
        {name: 'pregunta3', type: 'varchar', value: sale.pregunta3},
        {name: 'pregunta4', type: 'varchar', value: sale.pregunta4},
        {name: 'pregunta5', type: 'varchar', value: sale.pregunta5},
        {name: 'fechacierre', type: 'varchar', value: fechacierre},
        {name: 'pedido', type: 'varchar', value: sale.pedido},
        {name: 'archivoFE', type: 'varchar', value: sale.archivoFE},
        {name: 'UUID', type: 'varchar', value: sale.UUID},
        {name: 'ComprobanteXML', type: 'varchar', value: sale.ComprobanteXML},
        {name: 'tpago', type: 'varchar', value: sale.tpago},
        {name: 'FOLREL', type: 'varchar', value: sale.FOLREL},
        {name: 'SALDO', type: 'varchar', value: sale.SALDO},
        {name: 'RELFISCAL', type: 'varchar', value: sale.RELFISCAL},
        {name: 'FactDiaria', type: 'varchar', value: sale.FactDiaria},
        {name: 'migratedFrom', type: 'int', value: sale.VENTA},
    ]    
}

const salePartTypes = (sale, saleNumber) => {
    /*VENTA, TIPO_DOC, serieDocumento, NO_REFEREN, ARTICULO, CANTIDAD, PRECIO, COSTO, DESCUENTO, IMPUESTO, OBSERV, USUARIO, USUFECHA, USUHORA, ALMACEN, LISTA, CLAVE, PRCANTIDAD, PRDESCRIP, estado, PrecioBase, Autorizado, CAJA, COSTO_U */

    const format = 'MM/DD/YYYY'
    const usufecha = moment(sale.UsuFecha).add(1,'d').format(format)
    
    return [
        {name: 'VENTA', type: 'int', value: saleNumber},
        {name: 'TIPO_DOC', type: 'varchar', value: sale.TIPO_DOC},
        {name: 'serieDocumento', type: 'varchar', value: sale.serieDocumento},
        {name: 'NO_REFEREN', type: 'varchar', value: sale.NO_REFEREN},
        {name: 'ARTICULO', type: 'varchar', value: sale.ARTICULO},
        {name: 'CANTIDAD', type: 'varchar', value: sale.CANTIDAD},
        {name: 'PRECIO', type: 'float', value: sale.PRECIO},
        {name: 'COSTO', type: 'float', value: sale.COSTO},
        {name: 'DESCUENTO', type: 'varchar', value: sale.DESCUENTO},
        {name: 'IMPUESTO', type: 'varchar', value: sale.IMPUESTO},
        {name: 'OBSERV', type: 'varchar', value: sale.OBSERV},
        {name: 'USUARIO', type: 'varchar', value: sale.Usuario},
        {name: 'USUFECHA', type: 'varchar', value: usufecha},
        {name: 'USUHORA', type: 'varchar', value: sale.UsuHora},
        {name: 'ALMACEN', type: 'varchar', value: sale.ALMACEN},
        {name: 'LISTA', type: 'varchar', value: sale.LISTA},
        {name: 'CLAVE', type: 'varchar', value: sale.Clave},
        {name: 'PRCANTIDAD', type: 'varchar', value: sale.PRCANTIDAD},
        {name: 'PRDESCRIP', type: 'varchar', value: sale.PRDESCRIP},
        {name: 'estado', type: 'varchar', value: sale.estado},
        {name: 'PrecioBase', type: 'float', value: sale.PrecioBase},
        {name: 'Autorizado', type: 'varchar', value: sale.Autorizado},
        {name: 'Caja', type: 'varchar', value: sale.Caja},
        {name: 'costo_u', type: 'float', value: sale.costo_u},
    ]
}

const addCobdet = async ( cobdet, debtNumber) =>{
    return new Promise( async (resolve, reject) =>{
        for (const debtPart of cobdet) {
            const insertDebt = await MyBusiness20.executeQuery(`INSERT INTO cobdet (COBRANZA, CLIENTE, FECHA, serieDocumento, TIPO_DOC, NO_REFEREN, Cargo_ab, IMPORTE, MONEDA, TIP_CAM, VENTA, COBRADOR, OBSERV, ABONO, USUARIO, USUFECHA, USUHORA, CONCEPTO) VALUES (@COBRANZA, @CLIENTE, @FECHA, @serieDocumento, @TIPO_DOC, @NO_REFEREN, @Cargo_ab, @IMPORTE, @MONEDA, @TIP_CAM, @VENTA, @COBRADOR, @OBSERV, @ABONO, @USUARIO, @USUFECHA, @USUHORA, @CONCEPTO)`, cobdetTypes(debtPart, debtNumber))
    
            if(insertDebt.error) reject(`Error al insertar partidas de cobranza ${insertDebt.errorDetail}`)
        }

        resolve()
    })
    
}

const addDebts = async (saleNumber, debtNumber) =>{
    return new Promise( async (resolve, reject) =>{
        const debtQuery = await MyBusiness11.executeQuery('SELECT * FROM cobranza WHERE cobranza = @COBRANZA ', 
        [{name:'COBRANZA', type:'int', value: debtNumber}])

        const [debt] = debtQuery.data[0]
        if(debtQuery.error) reject(`Error al obtener cobranza ${debtQuery.errorDetail}`)
        if(debtQuery.data[0].length === 0){
            resolve(0)
            return
        }

        const cobdetQuery = await MyBusiness11.executeQuery('SELECT * FROM cobdet WHERE cobranza = @COBRANZA',
        [{name:'COBRANZA', type:'int', value: debtNumber}])
        
        const cobdet = cobdetQuery.data[0]
        if(debtQuery.error) reject(`Error al obtener partidas de cobranza ${cobdetQuery.errorDetail}`)

        const add = await MyBusiness20.executeQuery('INSERT INTO cobranza (CLIENTE, FECHA, serieDocumento, TIPO_DOC, NO_REFEREN, FECHA_VENC, IMPORTE, MONEDA, SALDO, TIP_CAM, VENTA, COBRADOR, ESTADO, OBSERV, USUARIO, USUFECHA, USUHORA, MIGRATEDFROM) VALUES (@CLIENTE, @FECHA, @serieDocumento, @TIPO_DOC, @NO_REFEREN, @FECHA_VENC, @IMPORTE, @MONEDA, @SALDO, @TIP_CAM, @VENTA, @COBRADOR, @ESTADO, @OBSERV, @USUARIO, @USUFECHA, @USUHORA, @MIGRATEDFROM)', cobranzaTypes(debt))

        if(add.error) reject(`Error al insertar cobranza ${add.errorDetail}`)

        const debtAddedQuery = await MyBusiness20.executeQuery('SELECT TOP 1 COBRANZA FROM cobranza order by cobranza DESC')

        if(debtAddedQuery.error) reject(`Error al obtener ultima cobranza ${debtAddedQuery.errorDetail}`)

        const [lastDebt] = debtAddedQuery.data[0]

        addCobdet(cobdet, lastDebt.COBRANZA)

        resolve(lastDebt.COBRANZA)

    })
}

const addSaleParts = async ( sale, saleNumber) =>{
    return new Promise( async ( resolve, reject ) => {

        console.log('Insertando partidas')
        const salePartsQuery = await MyBusiness11.executeQuery('SELECT * FROM partvta WHERE venta = @sale',
        [{name:'sale', type:'int', value: sale.VENTA}])

        const saleParts = salePartsQuery.data[0]

        if(salePartsQuery.error) reject(`Error al obtener partidas ${salePartsQuery.errorDetail}`)

        for (const salePart of saleParts) {
            const insertSalePart = await MyBusiness20.executeQuery(`INSERT INTO partvta (VENTA, TIPO_DOC, serieDocumento, NO_REFEREN, ARTICULO, CANTIDAD, PRECIO, COSTO, DESCUENTO, IMPUESTO, OBSERV, USUARIO, USUFECHA, USUHORA, ALMACEN, LISTA, CLAVE, PRCANTIDAD, PRDESCRIP, estado, PrecioBase, Autorizado, CAJA, costo_u)
            
            VALUES (@VENTA, @TIPO_DOC, @serieDocumento, @NO_REFEREN, @ARTICULO, @CANTIDAD, @PRECIO, @COSTO, @DESCUENTO, @IMPUESTO, @OBSERV, @USUARIO, @USUFECHA, @USUHORA, @ALMACEN, @LISTA, @CLAVE, @PRCANTIDAD, @PRDESCRIP, @estado, @PrecioBase, @Autorizado, @CAJA, @costo_u) `, salePartTypes(salePart, saleNumber))

            if(insertSalePart.error) console.log(insertSalePart.errorDetail)
        }

        resolve()

    })
}

const addSale = async (sale, cobranza) => {
    return new Promise ( async (resolve, reject) =>{
        const insert = await MyBusiness20.executeQuery(`INSERT INTO ventas (OCUPADO, TIPO_DOC, serieDocumento, NO_REFEREN, F_EMISION, F_VENC, CLIENTE, VEND, IMPORTE, DESCUENTO, IMPUESTO, PRECIO, COSTO, ALMACEN, ESTADO, OBSERV, TIPO_CAM, MONEDA, DESC1, DESC2, DESC3, DESC4, DESC5, DATOS, ENFAC, VENTAREF, CIERRE, cierretienda, DESGLOSE, COBRANZA, USUARIO, USUFECHA, USUHORA, AUTO, Relacion, PEDCLI, PEMB, DATEMB, AplicarDes, TipoVenta, Exportado, SUCURSAL, VentaSuc, Pago1, Pago2, Concepto1, Concepto2, Pago3, Concepto3, Comision, VentaOrigen, Diario, Caja, OrigenDev, Corte, Impreso, BANCO, NumeroCheque, estacion, interes, redondeo, Ticket, importar, sucremota, ventaremota, comodin, iespecial, nodesglosedetalle, Transporte, Repartidor, horasalida, horaregreso, comisiontel, verificado, donativo, pagado, comisionvendedor, comodin1, comodin2, comodin3, comodin4, pago4, concepto4, pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, fechacierre, pedido, archivoFE, UUID, ComprobanteXML, tpago, FOLREL, SALDO, RELFISCAL, FactDiaria, migratedFrom) 
        
        VALUES (@OCUPADO, @TIPO_DOC, @serieDocumento, @NO_REFEREN, @F_EMISION, @F_VENC, @CLIENTE, @VEND, @IMPORTE, @DESCUENTO, @IMPUESTO, @PRECIO, @COSTO, @ALMACEN, @ESTADO, @OBSERV, @TIPO_CAM, @MONEDA, @DESC1, @DESC2, @DESC3, @DESC4, @DESC5, @DATOS, @ENFAC, @VENTAREF, @CIERRE, @cierretienda, @DESGLOSE, @COBRANZA, @USUARIO, @USUFECHA, @USUHORA, @AUTO, @Relacion, @PEDCLI, @PEMB, @DATEMB, @AplicarDes, @TipoVenta, @Exportado, @SUCURSAL, @VentaSuc, @Pago1, @Pago2, @Concepto1, @Concepto2, @Pago3, @Concepto3, @Comision, @VentaOrigen, @Diario, @Caja, @OrigenDev, @Corte, @Impreso, @BANCO, @NumeroCheque, @estacion, @interes, @redondeo, @Ticket, @importar, @sucremota, @ventaremota, @comodin, @iespecial, @nodesglosedetalle, @Transporte, @Repartidor, @horasalida, @horaregreso, @comisiontel, @verificado, @donativo, @pagado, @comisionvendedor, @comodin1, @comodin2, @comodin3, @comodin4, @pago4, @concepto4, @pregunta1, @pregunta2, @pregunta3, @pregunta4, @pregunta5, @fechacierre, @pedido, @archivoFE, @UUID, @ComprobanteXML, @tpago, @FOLREL, @SALDO, @RELFISCAL, @FactDiaria, @migratedFrom)`, salesTypes(sale, cobranza))

        if(insert.error) reject(`Error al insertar venta ${insert.errorDetail}`)

        const saleInserted = await MyBusiness20.executeQuery(`SELECT TOP 1 VENTA FROM VENTAS ORDER BY VENTA DESC`)

        if(saleInserted.error) reject(`Error al obtener última venta ${saleInserted.errorDetail}`)

        const [saleNumber] = saleInserted.data[0]

        await addSaleParts( sale , saleNumber.VENTA)

        resolve(saleNumber.VENTA)

        //if(insertParts.error) reject(`Error al insertar partidas ${insertParts.errorDetail}`)
        //console.log('Venta Insertada con éxito', saleNumber.VENTA)
    })
}

const updateDebts = async (cobranza, saleNumber ) =>{
    return new Promise( async (resolve, reject) =>{
        const updateCobranza = MyBusiness20.executeQuery(`UPDATE cobranza SET venta = @sale WHERE cobranza = @cobranza`, 
        [{name: 'sale', type: 'int', value: saleNumber},
        {name: 'cobranza', type: 'int', value: cobranza}])

        if(updateCobranza.error) reject(`Error al actualizar cobranza ${updateCobranza.errorDetail}`)

        const updateCobdet = MyBusiness20.executeQuery(`UPDATE cobdet SET venta = @sale WHERE cobranza = @cobranza`, 
        [{name: 'sale', type: 'int', value: saleNumber},
        {name: 'cobranza', type: 'int', value: cobranza}])

        if(updateCobdet.error) reject(`Error al actualizar cobranza ${updateCobdet.errorDetail}`)

        resolve()
    })
}

const updateOldSale = async saleNumber =>{
    return new Promise( async (resolve, reject) =>{
        const updateSale = await MyBusiness11.executeQuery(`UPDATE ventas SET migrated = 1 WHERE venta = @sale`,[{name: 'sale', type: 'int', value: saleNumber}])

        if(updateSale.error) reject( `Error al actualizar venta migrada ${updateSale.errorDetail}`)

        resolve()
    })
}

const migrateSales = async () => {

    try {
        const successfullConfiguration = await configureTables()
        if(!successfullConfiguration) throw 'Error al configurar las tablas'

        const MyBusiness11Sales = await getMyBusiness11Sales()
        if(!MyBusiness11Sales) throw 'Error al obtener ventas'

        // console.log('Length ',MyBusiness11Sales)

        for (const sale of MyBusiness11Sales) {    
            console.log(`Insertando venta:`, sale.VENTA);
            let cobranza = 0
            if(sale.COBRANZA && sale.COBRANZA > 0 ) cobranza = await addDebts(sale.VENTA, sale.COBRANZA)

            const insertSale = await addSale(sale, cobranza)
            
            if(cobranza > 0) await updateDebts( cobranza, insertSale)

            await updateOldSale(sale.VENTA)
            console.log("Venta migrada con exito")
            //const insertSale = await MyBusiness20.executeQuery("INSERT INTO ventas () ")
        }

        console.log('Ventas migradas con éxito')
    } catch (error) {
        console.log(error)
    }
    
}

module.exports = {
    migrateSales
}