"""Ask the running Blender what its API actually is (engine ids, compositor, Glare, actions, video output).
Works on 4.5 and 5.x; each section reports its own error instead of stopping the probe.
    blender -b --factory-startup --python tools/probe_api.py > notes/blender-<version>-api-probe.txt
    modal run cloud/modal_blender.py --mode probe --blender 5.2      # the same probe on Blender 5 in the cloud
Re-run on a new Blender before trusting notes written for an older one.
"""
import bpy


def section(name, fn):
    try:
        fn()
    except Exception as exc:  # report and keep probing
        print(f"{name}_ERROR {type(exc).__name__}: {exc}")


def enum_ids(struct, prop):
    return [e.identifier for e in struct.bl_rna.properties[prop].enum_items]


def writable(struct):
    skip = {"location", "location_absolute", "width", "height", "name", "label", "parent", "warning_propagation",
            "use_custom_color", "color", "select", "show_options", "show_preview", "hide", "mute", "show_texture"}
    return [p.identifier for p in struct.bl_rna.properties
            if not p.is_readonly and p.identifier not in skip and not p.identifier.startswith("bl_")]


s = bpy.context.scene
print("VERSION", bpy.app.version_string)
section("ENGINES", lambda: print("ENGINES", enum_ids(s.render, "engine")))
section("EEVEE", lambda: print("EEVEE_PROPS", sorted(p.identifier for p in s.eevee.bl_rna.properties if any(
    k in p.identifier for k in ("bloom", "ray", "shadow", "volum", "taa", "fast_gi", "gtao")))))
section("RENDER", lambda: print("RENDER_MOTION_BLUR", hasattr(s.render, "use_motion_blur"), hasattr(s.render, "motion_blur_shutter")))
section("VIEW", lambda: print("VIEW_TRANSFORMS_SET_STANDARD", setattr(s.view_settings, "view_transform", "Standard") or s.view_settings.view_transform))
section("MIST", lambda: print("MIST", dict(use_pass_mist="use_pass_mist" in s.view_layers[0].bl_rna.properties,
                                           mist_settings=s.world is not None and "mist_settings" in s.world.bl_rna.properties)))


def compositor():
    print("COMPOSITOR_API", dict(scene_node_tree=hasattr(s, "node_tree"), scene_use_nodes=hasattr(s, "use_nodes"),
                                 compositing_node_group=hasattr(s, "compositing_node_group")))
    if hasattr(s, "compositing_node_group"):
        tree = bpy.data.node_groups.new("probe", "CompositorNodeTree")
        s.compositing_node_group = tree
    else:
        s.use_nodes = True
        tree = s.node_tree
    print("COMPOSITOR_NODE_TYPES", sorted(t for t in dir(bpy.types) if t.startswith("CompositorNode")))
    for t in ("CompositorNodeGlare", "CompositorNodeLensdist", "CompositorNodeRLayers", "CompositorNodeRGB",
              "CompositorNodeMixRGB", "ShaderNodeMix", "CompositorNodeComposite", "CompositorNodeViewer",
              "NodeGroupOutput"):
        try:
            n = tree.nodes.new(t)
            print("NODE", t, "inputs", [(i.name, i.type) for i in n.inputs], "outputs", [o.name for o in n.outputs],
                  "props", writable(n))
        except Exception as exc:
            print("NODE", t, "UNAVAILABLE", exc)
    print("TREE_INTERFACE", hasattr(tree, "interface"))


section("COMPOSITOR", compositor)


def materials():
    m = bpy.data.materials.new("probe")
    m.use_nodes = True
    print("MATERIAL", dict(has_tree=m.node_tree is not None, props=[p for p in ("use_backface_culling", "surface_render_method") if hasattr(m, p)]))
    print("PRINCIPLED_INPUTS", [i.name for i in m.node_tree.nodes["Principled BSDF"].inputs])
    w = bpy.data.worlds.new("probe")
    w.use_nodes = True
    print("WORLD_NODES", [n.bl_idname for n in w.node_tree.nodes])


section("MATERIALS", materials)


def actions():
    o = bpy.data.objects.new("probe", None)
    s.collection.objects.link(o)
    o.keyframe_insert("location", frame=1)
    a = o.animation_data.action
    print("ACTION_API", dict(legacy_fcurves=hasattr(a, "fcurves"), layers=hasattr(a, "layers"), slots=hasattr(a, "slots"),
                             fcurve_ensure_for_datablock=hasattr(a, "fcurve_ensure_for_datablock")))
    print("CHANNELBAG_FCURVES", len(a.layers[0].strips[0].channelbag(o.animation_data.action_slot).fcurves))


section("ACTIONS", actions)


def mesh_and_misc():
    me = bpy.data.meshes.new("probe")
    print("MESH_API", dict(shade_smooth=hasattr(me, "shade_smooth"), set_sharp_from_angle=hasattr(me, "set_sharp_from_angle")))
    print("OBJECT_VISIBLE_SHADOW", "visible_shadow" in bpy.types.Object.bl_rna.properties)
    seq = s.sequence_editor_create()
    print("SEQUENCER", dict(strips=hasattr(seq, "strips"), sequences=hasattr(seq, "sequences")))
    print("SOUND_BAKE_OPS", dict(sound_to_samples=hasattr(bpy.ops.graph, "sound_to_samples"), sound_bake=hasattr(bpy.ops.graph, "sound_bake")))


section("MISC", mesh_and_misc)


def video_output():
    im = s.render.image_settings
    print("IMAGE_SETTINGS_PROPS", writable(im))
    if "media_type" in im.bl_rna.properties:
        print("MEDIA_TYPES", enum_ids(im, "media_type"))
        im.media_type = "VIDEO"
    print("FILE_FORMATS", enum_ids(im, "file_format"))
    print("FFMPEG_PROPS", writable(s.render.ffmpeg))
    print("FFMPEG_CRF", enum_ids(s.render.ffmpeg, "constant_rate_factor"))


section("VIDEO", video_output)
