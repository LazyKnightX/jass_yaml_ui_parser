let fs = require('fs');
let jsyaml = require('js-yaml');

function parseJassDefineInfo(jassFile)
{
    let msg = fs.readFileSync(jassFile).toString();

    msg = msg.replace(/^ +\/\/ /gm, "");
    // console.log(msg);
    
    let results = msg.match(/<ui>.+?<\/ui>[\r\n]+([^\r\n]+)/gms);
    // console.log(results);
    
    let makeInfo = [];
    
    results.forEach(result =>
    {
        // let lines = result.split(/[\r\n]+/gms);
        // console.log(lines);
    
        let group = result.split(/ *public function /gms);
        // console.log(group);
    
        let _yaml = group[0].replace(/(<ui>|<\/ui>)/g, "");
        let _func = group[1];
    
        let _yamlData = jsyaml.safeLoad(_yaml);
    
        if (_yamlData.args)
        {
            _yamlData.args.forEach((arg, index) =>
            {
                let info = arg.match(/[^\(\) ]+/gms);
                // console.log('info', info);
                _yamlData.args[index] = info;
            });
        }
        // console.log(_yamlData);
    
        let _funcData = {};
        let _funcMatch = _func.match(/([^\(\)]+)/gms);
        _funcData.name = _funcMatch[0];
        if (_funcMatch[1] != null)
        {
            let _argsInfo = _funcMatch[1].split(/, /g);
            _argsInfo.forEach((info, index) =>
            {
                _argsInfo[index] = info.split(" ");
            });
            _funcData.args = _argsInfo;
        }
        if (_funcMatch[2] != null)
        {
            _funcData.return = _funcMatch[2].replace(" -> ", "");
        }
    
        makeInfo.push({
            yaml: _yamlData,
            func: _funcData,
        });
    });
    
    // console.log(makeInfo);
    
    // makeInfo.forEach(info =>
    // {
    //     let _yamlData = info.yaml;
    //     let _funcData = info.func;
    
    //     console.log();
    //     console.log(_yamlData);
    //     console.log();
    //     console.log(_funcData);
    // });

    return makeInfo;
}
function makeTriggerInfo(defineInfo)
{
    let content = "";

    defineInfo.forEach(info =>
    {
        let yamlData = info.yaml;
        let funcData = info.func;

        let name = funcData.name;
        let args = yamlData.args;
        let returnType = funcData.return;

        let title = yamlData.title;
        let desc = yamlData.desc;
        let cate = yamlData.cate;

        let inject = {};
        inject.head = 
`[${name}]
title = "${title}"
description = "${desc}"
category = ${cate}`;
        if (returnType)
        {
            inject.head += `\r\nreturns = ${returnType}`;
        }

        inject.args = "";
        args.forEach(arg =>
        {
            let _type = arg[0];
            let _defaultValue = arg[1];
            inject.args += 
`[[.args]]
type = ${_type}
default = "${_defaultValue}"\r\n`;
        });

        content += `${inject.head}
${inject.args}\r\n`;
    });
    return content;
}

// let triggerInfo = makeTriggerInfo(parseJassDefineInfo("./../Source/jass/xywe/XYMath.j"));
// console.log(triggerInfo);

module.exports = {
    parseJassDefineInfo,
    makeTriggerInfo,
}
