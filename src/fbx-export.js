const fs = require('fs');

function createObject({ name, type, subtype, point, parentName }) {
    return {
        name: `${type}::${name}`,
        shortName: name,
        type,
        subtype: subtype || (type === 'Material' ? '' : type === 'Pose' ? 'BindPose' : 'Null'),
        point: point || {x:0,y:0,z:0},
        parentName: parentName || 'Model::Scene'
    };
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  }

function processItemForExport(item) {
    let processed = {
        objects: []
    };

    processed.root = createObject({
        name: item.name,
        type: 'Model'
    });
    processed.objects.push(processed.root);

    let areaCount = 0;
    let anchorCount = 0;
    let meshCount = 0;
    let materialCount = 0;

    for (let path of item.paths) {
        let pathObject = createObject({
            name: `Area${areaCount++}`,
            type: 'Model',
            parentName: processed.root.name
        });
        processed.objects.push(pathObject);

        for (let point of path.points) {            
            processed.objects.push(createObject({
                name: `Anchor${anchorCount++}`,
                type: 'Model',
                point: { x: point.x, y: point.y, z: 0},
                parentName: pathObject.name
            }));
        }

        let meshObject = createObject({
            name: `glaze${meshCount++}`,
            type: 'Model',
            subtype: 'Mesh',
            parentName: pathObject.name
        });
        processed.objects.push(meshObject);

        let materialObject = createObject({
            name: `Material${materialCount++}`,
            type: 'Material',
            parentName: meshObject.name
        });
        materialObject.color = hexToRgb(path.color || '#FFFFFF');
        processed.objects.push(materialObject);
    }
    return processed;
}

function writeHeader(file, processed) {
    var now = new Date();    
    
    file.write(`; FBX 6.1.0 project file
; Created by SVG Anchor Export
; for support mail: george@playbite.com
; ----------------------------------------------------

FBXHeaderExtension:  {
	FBXHeaderVersion: 1003
	FBXVersion: 6100
	CreationTimeStamp:  {
		Version: 1000
		Year: 2019
		Month: 10
		Day: 03
		Hour: 10
		Minute: 01
		Second: 31
		Millisecond: 0
	}
	Creator: "SVG Anchor Export"
	OtherFlags:  {
		FlagPLE: 0
	}
}
CreationTime: "2019-10-03 10:01:31:000"
Creator: "SVG Anchor Export 0.10 (sub 0)"
`);
}

function writeDefinitions(file, processed) {
    let modelCount = processed.objects.reduce((count, o) => count + (o.type === 'Model' ? 1 : 0), 0);
    let geoCount = processed.objects.reduce((count, o) => count + (o.subtype === 'Mesh' ? 1 : 0), 0);
    let materialCount = processed.objects.reduce((count, o) => count + (o.type === 'Material' ? 1 : 0), 0);
    file.write(`
; Object definitions
;------------------------------------------------------------------

Definitions:  {
    Version: 100
    Count: ${modelCount + geoCount + materialCount}
    ObjectType: "Model" {
        Count: ${modelCount}
    }
    ObjectType: "Geometry" {
        Count: ${geoCount}
    }
    ObjectType: "Material" {
        Count: ${materialCount}
    }
    ObjectType: "Pose" {
        Count: 1
    }
    ObjectType: "GlobalSettings" {
        Count: 1
    }
}`);
}

function floatStr(value, decimalPlaces = 15) {
    return Number(Math.round(parseFloat(value + 'e' + decimalPlaces)) + 'e-' + decimalPlaces).toFixed(decimalPlaces);
}

function writeModelObject(file, o) {
    file.write(`
    ${o.type}: "${o.name}", "${o.subtype}" {
		Version: 232
		Properties60:  {
			Property: "QuaternionInterpolate", "bool", "",0
			Property: "Visibility", "Visibility", "A+",1
			Property: "Lcl Translation", "Lcl Translation", "A+",${floatStr(o.point.x)},${floatStr(o.point.z)},${floatStr(o.point.y)}
			Property: "Lcl Rotation", "Lcl Rotation", "A+",0.000000000000000,0.000000000000000,0.000000000000000
			Property: "Lcl Scaling", "Lcl Scaling", "A+",1.000000000000000,1.000000000000000,1.000000000000000
			Property: "RotationOffset", "Vector3D", "",0,0,0
			Property: "RotationPivot", "Vector3D", "",0,0,0
			Property: "ScalingOffset", "Vector3D", "",0,0,0
			Property: "ScalingPivot", "Vector3D", "",0,0,0
			Property: "TranslationActive", "bool", "",0
			Property: "TranslationMin", "Vector3D", "",0,0,0
			Property: "TranslationMax", "Vector3D", "",0,0,0
			Property: "TranslationMinX", "bool", "",0
			Property: "TranslationMinY", "bool", "",0
			Property: "TranslationMinZ", "bool", "",0
			Property: "TranslationMaxX", "bool", "",0
			Property: "TranslationMaxY", "bool", "",0
			Property: "TranslationMaxZ", "bool", "",0
			Property: "RotationOrder", "enum", "",0
			Property: "RotationSpaceForLimitOnly", "bool", "",0
			Property: "AxisLen", "double", "",10
			Property: "PreRotation", "Vector3D", "",0,0,0
			Property: "PostRotation", "Vector3D", "",0,0,0
			Property: "RotationActive", "bool", "",0
			Property: "RotationMin", "Vector3D", "",0,0,0
			Property: "RotationMax", "Vector3D", "",0,0,0
			Property: "RotationMinX", "bool", "",0
			Property: "RotationMinY", "bool", "",0
			Property: "RotationMinZ", "bool", "",0
			Property: "RotationMaxX", "bool", "",0
			Property: "RotationMaxY", "bool", "",0
			Property: "RotationMaxZ", "bool", "",0
			Property: "RotationStiffnessX", "double", "",0
			Property: "RotationStiffnessY", "double", "",0
			Property: "RotationStiffnessZ", "double", "",0
			Property: "MinDampRangeX", "double", "",0
			Property: "MinDampRangeY", "double", "",0
			Property: "MinDampRangeZ", "double", "",0
			Property: "MaxDampRangeX", "double", "",0
			Property: "MaxDampRangeY", "double", "",0
			Property: "MaxDampRangeZ", "double", "",0
			Property: "MinDampStrengthX", "double", "",0
			Property: "MinDampStrengthY", "double", "",0
			Property: "MinDampStrengthZ", "double", "",0
			Property: "MaxDampStrengthX", "double", "",0
			Property: "MaxDampStrengthY", "double", "",0
			Property: "MaxDampStrengthZ", "double", "",0
			Property: "PreferedAngleX", "double", "",0
			Property: "PreferedAngleY", "double", "",0
			Property: "PreferedAngleZ", "double", "",0
			Property: "InheritType", "enum", "",0
			Property: "ScalingActive", "bool", "",0
			Property: "ScalingMin", "Vector3D", "",1,1,1
			Property: "ScalingMax", "Vector3D", "",1,1,1
			Property: "ScalingMinX", "bool", "",0
			Property: "ScalingMinY", "bool", "",0
			Property: "ScalingMinZ", "bool", "",0
			Property: "ScalingMaxX", "bool", "",0
			Property: "ScalingMaxY", "bool", "",0
			Property: "ScalingMaxZ", "bool", "",0
			Property: "GeometricTranslation", "Vector3D", "",0,0,0
			Property: "GeometricRotation", "Vector3D", "",0,0,0
			Property: "GeometricScaling", "Vector3D", "",1,1,1
			Property: "LookAtProperty", "object", ""
			Property: "UpVectorProperty", "object", ""
			Property: "Show", "bool", "",1
			Property: "NegativePercentShapeSupport", "bool", "",1
			Property: "DefaultAttributeIndex", "int", "",0
			Property: "Color", "Color", "A",0.8,0.8,0.8
			Property: "Size", "double", "",100
            Property: "Look", "enum", "",1
        }
		MultiLayer: 0
		MultiTake: 1
		Shading: Y
		Culling: "CullingOff"`);
    if (o.subtype === 'Mesh') {
        file.write(`
        Vertices: -1.000000,-1.000000,-1.000000,-1.000000,-1.000000,1.000000,-1.000000,1.000000,-1.000000,-1.000000,1.000000,1.000000,
		          1.000000,-1.000000,-1.000000,1.000000,-1.000000,1.000000,1.000000,1.000000,-1.000000,1.000000,1.000000,1.000000
		PolygonVertexIndex: 0,1,3,-3,2,3,7,-7,6,7,5,-5,4,5,1,-1,2,6,4,-1,7,3,1,-6
		GeometryVersion: 124
		LayerElementNormal: 0 {
			Version: 101
			Name: ""
			MappingInformationType: "ByPolygonVertex"
			ReferenceInformationType: "Direct"
			Normals: -1.000000,0.000000,0.000000,-1.000000,0.000000,0.000000,-1.000000,0.000000,0.000000,-1.000000,0.000000,0.000000,
			         0.000000,1.000000,0.000000,0.000000,1.000000,0.000000,0.000000,1.000000,0.000000,0.000000,1.000000,0.000000,
			         1.000000,0.000000,0.000000,1.000000,0.000000,0.000000,1.000000,0.000000,0.000000,1.000000,0.000000,0.000000,
			         0.000000,-1.000000,0.000000,0.000000,-1.000000,0.000000,0.000000,-1.000000,0.000000,0.000000,-1.000000,0.000000,
			         0.000000,0.000000,-1.000000,0.000000,0.000000,-1.000000,0.000000,0.000000,-1.000000,0.000000,0.000000,-1.000000,
			         0.000000,0.000000,1.000000,0.000000,0.000000,1.000000,0.000000,0.000000,1.000000,0.000000,0.000000,1.000000
		}
		LayerElementMaterial: 0 {
			Version: 101
			Name: ""
			MappingInformationType: "AllSame"
			ReferenceInformationType: "IndexToDirect"
			Materials: 0
		}
		Layer: 0 {
			Version: 100
			LayerElement:  {
				Type: "LayerElementNormal"
				TypedIndex: 0
			}
			LayerElement:  {
				Type: "LayerElementTexture"
				TypedIndex: 0
			}
			LayerElement:  {
				Type: "LayerElementMaterial"
				TypedIndex: 0
			}
        }`);
    }
    else {
        file.write(`
        TypeFlags: "Null"`);
    }

    file.write(`
    }`);
}

function writeMaterialObject(file, o) {
    file.write(`
    ${o.type}: "${o.name}", "${o.subtype}" {
        Version: 102
		ShadingModel: "lambert"
		MultiLayer: 0
		Properties60:  {
			Property: "ShadingModel", "KString", "", "Lambert"
			Property: "MultiLayer", "bool", "",0
			Property: "EmissiveColor", "ColorRGB", "",${floatStr(o.color.r, 4)},${floatStr(o.color.g, 4)},${floatStr(o.color.b, 4)}
			Property: "EmissiveFactor", "double", "",0.0000
			Property: "AmbientColor", "ColorRGB", "",1.0000,1.0000,1.0000
			Property: "AmbientFactor", "double", "",1.0000
			Property: "DiffuseColor", "ColorRGB", "",${floatStr(o.color.r, 4)},${floatStr(o.color.g, 4)},${floatStr(o.color.b, 4)}
			Property: "DiffuseFactor", "double", "",0.8000
			Property: "Bump", "Vector3D", "",0,0,0
			Property: "TransparentColor", "ColorRGB", "",1,1,1
			Property: "TransparencyFactor", "double", "",0.0000
			Property: "SpecularColor", "ColorRGB", "",${floatStr(o.color.r, 4)},${floatStr(o.color.g, 4)},${floatStr(o.color.b, 4)}
			Property: "SpecularFactor", "double", "",1.0000
			Property: "ShininessExponent", "double", "",12.3
			Property: "ReflectionColor", "ColorRGB", "",0,0,0
			Property: "ReflectionFactor", "double", "",1
			Property: "Emissive", "ColorRGB", "",0,0,0
			Property: "Ambient", "ColorRGB", "",1.0,1.0,1.0
			Property: "Diffuse", "ColorRGB", "",1.0,0.8,0.0
			Property: "Specular", "ColorRGB", "",1.0,0.7,0.0
			Property: "Shininess", "double", "",12.3
			Property: "Opacity", "double", "",1.0
			Property: "Reflectivity", "double", "",0
		}
    }`);
}

function writeObject(file, o) {
    if (o.type === 'Model') {
        writeModelObject(file, o);
    }
    else if (o.type === 'Material') {
        writeMaterialObject(file, o);
    }
}

function writePoseObject(file, objects) {
    let nodes = objects.filter(o => o.type === 'Model');

    file.write(`
    Pose: "Pose::BIND_POSES", "BindPose" {
		Type: "BindPose"
		Version: 100
		Properties60:  {
		}
		NbPoseNodes: ${nodes.length}`);

    for (let n of nodes) {
        file.write(`
        PoseNode:  {
			Node: "${n.name}"
			Matrix: 1.000000000000000,0.000000000000000,0.000000000000000,0.000000000000000,0.000000000000000,1.000000000000000,0.000000000000000,0.000000000000000,0.000000000000000,0.000000000000000,0.000000000000000,0.000000000000000,${floatStr(n.point.x)},${floatStr(n.point.y)},${floatStr(n.point.z)},1.000000000000000
		}`);
    }

    file.write(`
    }`);
}

function writeObjects(file, processed) {    
    file.write(`
; Object properties
;------------------------------------------------------------------

Objects:  {`);

    for (let o of processed.objects) {
        writeObject(file, o);
    }

    writePoseObject(file, processed.objects);

    file.write(`
    GlobalSettings:  {
		Version: 1000
		Properties60:  {
			Property: "UpAxis", "int", "",1
			Property: "UpAxisSign", "int", "",1
			Property: "FrontAxis", "int", "",2
			Property: "FrontAxisSign", "int", "",1
			Property: "CoordAxis", "int", "",0
			Property: "CoordAxisSign", "int", "",1
			Property: "UnitScaleFactor", "double", "",1
		}
	}
}`);
}

function writeObjectRelations(file, processed) {
    file.write(`
; Object relations
;------------------------------------------------------------------

Relations:  {`);

    for (let o of processed.objects) {
        file.write(`
        ${o.type}: "${o.name}", "${o.subtype}" {
        }`);
    }

    file.write(`
    Model: "Model::Producer Perspective", "Camera" {
	}
	Model: "Model::Producer Top", "Camera" {
	}
	Model: "Model::Producer Bottom", "Camera" {
	}
	Model: "Model::Producer Front", "Camera" {
	}
	Model: "Model::Producer Back", "Camera" {
	}
	Model: "Model::Producer Right", "Camera" {
	}
	Model: "Model::Producer Left", "Camera" {
	}
	Model: "Model::Camera Switcher", "CameraSwitcher" {
	}
}`);
}

function writeObjectConnections(file, processed) {
    file.write(`
; Object connections
;------------------------------------------------------------------

Connections:  {`);

    for (let o of processed.objects) {
        file.write(`
        Connect: "OO", "${o.name}", "${o.parentName}"`);
    }

    file.write(`
}`);
}

function writeFooter(file, processed) {
    file.write(`
;Takes and animation section
;----------------------------------------------------

Takes:  {
    Current: ""
}
;Version 5 settings
;------------------------------------------------------------------

Version5:  {
	AmbientRenderSettings:  {
		Version: 101
		AmbientLightColor: 0.0,0.0,0.0,0
	}
	FogOptions:  {
		FogEnable: 0
		FogMode: 0
		FogDensity: 0.000
		FogStart: 5.000
		FogEnd: 25.000
		FogColor: 0.1,0.1,0.1,1
	}
	Settings:  {
		FrameRate: "24"
		TimeFormat: 1
		SnapOnFrames: 0
		ReferenceTimeIndex: -1
		TimeLineStartTime: 0
		TimeLineStopTime: 479181389250
	}
	RendererSetting:  {
		DefaultCamera: "Producer Perspective"
		DefaultViewingMode: 0
	}
}`);
}

function exportFbxFile(file, item) {
    let processed = processItemForExport(item);
    writeHeader(file, processed);
    writeDefinitions(file, processed);
    writeObjects(file, processed);
    writeObjectRelations(file, processed);
    writeObjectConnections(file, processed);
    writeFooter(file, processed);
}


module.exports.exportFbxFiles = function(folderPath, data) {
    for (let item of data) {
        let filePath = require("path").join(folderPath, item.name + '.fbx');
        console.log(`Exporting file: ${filePath}...`);
        let file = fs.createWriteStream(filePath);
        try {
            exportFbxFile(file, item);
        }
        catch(e) {
            console.log('Failed.', e.stack);
        }
        finally {
            file.end();
        }
    }
}
