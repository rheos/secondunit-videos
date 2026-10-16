"""Ask the installed Blender what its API actually is (engine ids, Glare sockets, slotted actions ...).
    blender -b --factory-startup --python tools/probe_api.py > notes/blender-<version>-api-probe.txt
Re-run on a new Blender before trusting notes written for an older one.
"""
import bpy

s = bpy.context.scene
print("VERSION", bpy.app.version_string)
print("ENGINES", [e.identifier for e in s.render.bl_rna.properties["engine"].enum_items])
print("EEVEE_PROPS", sorted(p.identifier for p in s.eevee.bl_rna.properties
                            if any(k in p.identifier for k in ("bloom", "ray", "shadow", "volum", "taa", "fast_gi", "gtao"))))
print("RENDER_MOTION_BLUR", hasattr(s.render, "use_motion_blur"), hasattr(s.render, "motion_blur_shutter"))

s.use_nodes = True
nt = s.node_tree
g = nt.nodes.new("CompositorNodeGlare")
print("GLARE_TYPES", [e.identifier for e in g.bl_rna.properties["glare_type"].enum_items])
print("GLARE_INPUTS", [(i.name, getattr(i, "default_value", None) if i.type != "RGBA" else tuple(i.default_value)) for i in g.inputs])
for t in ("CompositorNodeMixRGB", "CompositorNodeLensdist", "CompositorNodeBlur"):
    print("NODE", t, [i.name for i in nt.nodes.new(t).inputs])

m = bpy.data.materials.new("probe")
m.use_nodes = True
print("PRINCIPLED_INPUTS", [i.name for i in m.node_tree.nodes["Principled BSDF"].inputs])
print("MATERIAL_PROPS", [p for p in ("use_backface_culling", "surface_render_method", "blend_method") if hasattr(m, p)])

o = bpy.data.objects.new("probe", None)
s.collection.objects.link(o)
o.keyframe_insert("location", frame=1)
a = o.animation_data.action
print("ACTION_API", dict(legacy_fcurves=hasattr(a, "fcurves"), layers=hasattr(a, "layers"), slots=hasattr(a, "slots"),
                         fcurve_ensure_for_datablock=hasattr(a, "fcurve_ensure_for_datablock")))
print("CHANNELBAG_FCURVES", len(a.layers[0].strips[0].channelbag(o.animation_data.action_slot).fcurves))

me = bpy.data.meshes.new("probe")
print("MESH_API", dict(shade_smooth=hasattr(me, "shade_smooth"), set_sharp_from_angle=hasattr(me, "set_sharp_from_angle")))
seq = s.sequence_editor_create()
print("SEQUENCER", dict(strips=hasattr(seq, "strips"), sequences=hasattr(seq, "sequences")))
print("FFMPEG_CRF", [e.identifier for e in s.render.ffmpeg.bl_rna.properties["constant_rate_factor"].enum_items])
print("SOUND_BAKE_OPS", dict(sound_to_samples=hasattr(bpy.ops.graph, "sound_to_samples"), sound_bake=hasattr(bpy.ops.graph, "sound_bake")))
