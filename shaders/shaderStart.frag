#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;

in vec4 fragPosLightSpace;

out vec4 fColor;

//lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;

uniform vec3 lightDir2;
uniform vec3 lightColor2;

uniform vec3 globalAmbientColor;
float globalAmbientStrength = 0.1f;


//texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;

//shadow map
uniform sampler2D shadowMap;

vec3 ambient;

float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 32.0f;




float shadow;

float computeShadow() 
{
	float bias = 0.005f;
	//perform perspective divide
	vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

	normalizedCoords = normalizedCoords * 0.5 + 0.5;
	float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
	
	if (normalizedCoords.z > 1.0f)
		return 0.0f;

	float currentDepth = normalizedCoords.z;

	//check if current pos in shadow
	return (currentDepth - bias) > closestDepth ? 1.0 : 0.0;
}

void computeLightComponents()
{
    vec3 cameraPosEye = vec3(0.0f);
    vec3 normalEye = normalize(fNormal);

    // Compute first light direction
    vec3 lightDirN = normalize(lightDir);
    vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);

    // Compute ambient light for the first light
    ambient = ambientStrength * lightColor;

    vec3 ambient2 = ambientStrength * lightColor2;


    // Compute diffuse light for the first light
    diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;

    vec3 diffuse2 = max(dot(normalEye, lightDirN), 0.0f) * lightColor2;

    // Compute specular light for the first light
    vec3 reflection = reflect(-lightDirN, normalEye);
    float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
    specular = specularStrength * specCoeff * lightColor;

    vec3 reflection2 = reflect(-normalize(lightDir2), normalEye);
    float specCoeff2 = pow(max(dot(viewDirN, reflection2), 0.0f), shininess);
    vec3 specular2 = specularStrength * specCoeff2 * lightColor2;

    ambient += ambient2;
    diffuse += diffuse2;
    specular += specular2;

    // Add global ambient light
    ambient += globalAmbientStrength * globalAmbientColor;
}

float computeFog()
{
 float fogDensity = 0.003f;
 float fragmentDistance = length(fPosEye);
 float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
 
 return clamp(fogFactor, 0.0f, 1.0f);
}



void main() 
{
	computeLightComponents();

    vec3 baseColor = vec3(0.9f, 0.35f, 0.0f); // orange

    ambient *= texture(diffuseTexture, fTexCoords).rgb;
    diffuse *= texture(diffuseTexture, fTexCoords).rgb;
    specular *= texture(specularTexture, fTexCoords).rgb;

    // Update the shadow calculation to only consider the first light
    shadow = computeShadow();

    // Combine ambient, diffuse, and specular considering shadows for the first light only
    vec3 color = min((ambient + (1.0f - shadow) * diffuse) + (1.0f - shadow) * specular, 1.0f);
    float fogFactor = computeFog();
    vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f);
    fColor = vec4(fogColor.rgb * (1 - fogFactor) + color * fogFactor, 1.0);
}